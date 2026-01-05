import { useState, useEffect, useCallback } from "react";
import { supabase, offlineQueue } from "../lib/supabase";

export function useChallenge(userId) {
  const [challenge, setChallenge] = useState(null);
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate current day number
  const getCurrentDayNumber = useCallback(() => {
    if (!challenge?.start_date) return 1;
    // Parse date as local time, not UTC
    const [year, month, day] = challenge.start_date.split('-').map(Number);
    const start = new Date(year, month - 1, day);
    const today = new Date();
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(diffDays, challenge.duration));
  }, [challenge]);

  // Fetch challenge and habits
  const fetchChallenge = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Fetch challenge
      const { data: challengeData, error: challengeError } = await supabase
        .from("challenges")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (challengeError && challengeError.code !== "PGRST116") {
        throw challengeError;
      }

      if (challengeData) {
        setChallenge(challengeData);

        // Fetch habits
        const { data: habitsData, error: habitsError } = await supabase
          .from("habits")
          .select("*")
          .eq("challenge_id", challengeData.id)
          .order("sort_order", { ascending: true });

        if (habitsError) throw habitsError;
        setHabits(habitsData || []);

        // Fetch completions
        const { data: completionsData, error: completionsError } = await supabase
          .from("completions")
          .select("*")
          .in("habit_id", (habitsData || []).map(h => h.id));

        if (completionsError) throw completionsError;
        setCompletions(completionsData || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchChallenge();

    // Sync offline queue
    offlineQueue.sync();
  }, [fetchChallenge]);

  // Create new challenge
  const createChallenge = useCallback(async (name, duration, habitsList) => {
    if (!userId) return;

    setLoading(true);
    try {
      // Create challenge
      const { data: newChallenge, error: challengeError } = await supabase
        .from("challenges")
        .insert({
          user_id: userId,
          name,
          duration,
          start_date: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

      if (challengeError) throw challengeError;

      // Create habits
      const habitsToInsert = habitsList.map((habit, index) => ({
        challenge_id: newChallenge.id,
        name: habit.name,
        sublabel: habit.sublabel || null,
        frequency: habit.frequency,
        specific_days: habit.specific_days || null,
        is_weekly_goal: habit.is_weekly_goal || false,
        sort_order: index,
      }));

      const { data: newHabits, error: habitsError } = await supabase
        .from("habits")
        .insert(habitsToInsert)
        .select();

      if (habitsError) throw habitsError;

      setChallenge(newChallenge);
      setHabits(newHabits);
      setCompletions([]);

      return newChallenge;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Toggle habit completion
  const toggleCompletion = useCallback(async (habitId, dayNumber) => {
    const isCompleted = completions.some(
      c => c.habit_id === habitId && c.day_number === dayNumber
    );

    // Optimistic update
    if (isCompleted) {
      setCompletions(prev => prev.filter(
        c => !(c.habit_id === habitId && c.day_number === dayNumber)
      ));
    } else {
      const newCompletion = {
        id: `temp-${Date.now()}`,
        habit_id: habitId,
        day_number: dayNumber,
        completed_at: new Date().toISOString(),
      };
      setCompletions(prev => [...prev, newCompletion]);
    }

    // Check if online
    if (!navigator.onLine) {
      offlineQueue.add({
        action: isCompleted ? "uncomplete" : "complete",
        habit_id: habitId,
        day_number: dayNumber,
      });
      return;
    }

    try {
      if (isCompleted) {
        await supabase
          .from("completions")
          .delete()
          .eq("habit_id", habitId)
          .eq("day_number", dayNumber);
      } else {
        const { data } = await supabase
          .from("completions")
          .insert({
            habit_id: habitId,
            day_number: dayNumber,
          })
          .select()
          .single();

        // Update with real ID
        setCompletions(prev =>
          prev.map(c =>
            c.id.startsWith("temp-") && c.habit_id === habitId && c.day_number === dayNumber
              ? data
              : c
          )
        );
      }
    } catch (err) {
      // Revert optimistic update
      if (isCompleted) {
        setCompletions(prev => [...prev, {
          id: `temp-${Date.now()}`,
          habit_id: habitId,
          day_number: dayNumber,
          completed_at: new Date().toISOString(),
        }]);
      } else {
        setCompletions(prev => prev.filter(
          c => !(c.habit_id === habitId && c.day_number === dayNumber)
        ));
      }
      setError(err.message);
    }
  }, [completions]);

  // Get habits for a specific day
  const getHabitsForDay = useCallback((dayNumber) => {
    if (!challenge) return [];

    // Parse date as local time, not UTC
    const [year, month, day] = challenge.start_date.split('-').map(Number);
    const startDate = new Date(year, month - 1, day);
    const targetDate = new Date(startDate);
    targetDate.setDate(targetDate.getDate() + dayNumber - 1);
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday

    return habits.filter(habit => {
      if (habit.frequency === "daily") return true;
      if (habit.frequency === "weekly" || habit.frequency === "specific_days") {
        return habit.specific_days?.includes(dayOfWeek);
      }
      return true;
    });
  }, [habits, challenge]);

  // Get completions for a specific day
  const getCompletionsForDay = useCallback((dayNumber) => {
    return completions.filter(c => c.day_number === dayNumber);
  }, [completions]);

  // Calculate completion percentage for a day
  const getDayCompletionPercentage = useCallback((dayNumber) => {
    const dayHabits = getHabitsForDay(dayNumber);
    if (dayHabits.length === 0) return 100;

    const dayCompletions = getCompletionsForDay(dayNumber);
    const completedCount = dayHabits.filter(h =>
      dayCompletions.some(c => c.habit_id === h.id)
    ).length;

    return Math.round((completedCount / dayHabits.length) * 100);
  }, [getHabitsForDay, getCompletionsForDay]);

  // Calculate streak
  const calculateStreak = useCallback(() => {
    if (!challenge) return 0;

    const currentDay = getCurrentDayNumber();
    let streak = 0;

    for (let day = currentDay; day >= 1; day--) {
      const percentage = getDayCompletionPercentage(day);
      if (percentage === 100) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [challenge, getCurrentDayNumber, getDayCompletionPercentage]);

  // Calculate best streak
  const calculateBestStreak = useCallback(() => {
    if (!challenge) return 0;

    const currentDay = getCurrentDayNumber();
    let bestStreak = 0;
    let currentStreak = 0;

    for (let day = 1; day <= currentDay; day++) {
      const percentage = getDayCompletionPercentage(day);
      if (percentage === 100) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return bestStreak;
  }, [challenge, getCurrentDayNumber, getDayCompletionPercentage]);

  // Calculate overall completion
  const calculateOverallCompletion = useCallback(() => {
    if (!challenge) return 0;

    const currentDay = getCurrentDayNumber();
    let totalPercentage = 0;

    for (let day = 1; day <= currentDay; day++) {
      totalPercentage += getDayCompletionPercentage(day);
    }

    return Math.round(totalPercentage / currentDay);
  }, [challenge, getCurrentDayNumber, getDayCompletionPercentage]);

  return {
    challenge,
    habits,
    completions,
    loading,
    error,
    createChallenge,
    toggleCompletion,
    getCurrentDayNumber,
    getHabitsForDay,
    getCompletionsForDay,
    getDayCompletionPercentage,
    calculateStreak,
    calculateBestStreak,
    calculateOverallCompletion,
    refetch: fetchChallenge,
  };
}
