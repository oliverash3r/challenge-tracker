import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Calendar,
  BarChart2,
} from "lucide-react";
import HabitCard from "./HabitCard";
import ProgressRing from "./ProgressRing";

export default function DayView({
  challenge,
  habits,
  completions,
  currentDayNumber,
  getHabitsForDay,
  getCompletionsForDay,
  getDayCompletionPercentage,
  toggleCompletion,
  streak,
  onShowCalendar,
  onShowStats,
}) {
  const [selectedDay, setSelectedDay] = useState(currentDayNumber);

  const dayHabits = useMemo(
    () => getHabitsForDay(selectedDay),
    [getHabitsForDay, selectedDay]
  );

  const dayCompletions = useMemo(
    () => getCompletionsForDay(selectedDay),
    [getCompletionsForDay, selectedDay]
  );

  const percentage = useMemo(
    () => getDayCompletionPercentage(selectedDay),
    [getDayCompletionPercentage, selectedDay]
  );

  const isToday = selectedDay === currentDayNumber;
  const isFuture = selectedDay > currentDayNumber;
  const canEdit = !isFuture;

  // Separate daily habits from weekly goals
  const dailyHabits = dayHabits.filter((h) => !h.is_weekly_goal);
  const weeklyGoals = dayHabits.filter((h) => h.is_weekly_goal);

  const goToPreviousDay = () => {
    if (selectedDay > 1) setSelectedDay(selectedDay - 1);
  };

  const goToNextDay = () => {
    if (selectedDay < currentDayNumber) setSelectedDay(selectedDay + 1);
  };

  const getDateForDay = (dayNumber) => {
    if (!challenge?.start_date) return "";
    // Parse date as local time, not UTC
    const [year, month, day] = challenge.start_date.split('-').map(Number);
    const start = new Date(year, month - 1, day);
    start.setDate(start.getDate() + dayNumber - 1);
    return start.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="min-h-screen flex flex-col safe-top safe-bottom">
      {/* Header */}
      <header className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg leading-tight">
                {challenge?.name || "75 Day Challenge"}
              </h1>
              <p className="text-xs text-purple-200/70">
                Día {selectedDay} de {challenge?.duration || 75}
              </p>
            </div>
          </div>

          {/* Streak Badge */}
          {streak > 0 && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-300">
                {streak}
              </span>
            </div>
          )}
        </div>

        {/* Day Navigation */}
        <div className="flex items-center justify-between bg-white/5 rounded-2xl p-2">
          <button
            onClick={goToPreviousDay}
            disabled={selectedDay <= 1}
            className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center flex-1">
            <div className="text-lg font-semibold text-white">
              {isToday ? "Hoy" : `Día ${selectedDay}`}
            </div>
            <div className="text-xs text-purple-200/70 capitalize">
              {getDateForDay(selectedDay)}
            </div>
          </div>

          <button
            onClick={goToNextDay}
            disabled={selectedDay >= currentDayNumber}
            className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Progress Ring */}
      <div className="flex justify-center py-6">
        <ProgressRing percentage={percentage} size={140} strokeWidth={12}>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{percentage}%</div>
            <div className="text-xs text-purple-200/70">
              {dayCompletions.length}/{dayHabits.length} completados
            </div>
          </div>
        </ProgressRing>
      </div>

      {/* Habits List */}
      <div className="flex-1 px-4 pb-24 overflow-y-auto">
        {/* Daily Habits */}
        {dailyHabits.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm text-purple-200/70 mb-2 px-1">
              Hábitos Diarios
            </h3>
            <div className="space-y-2">
              {dailyHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompleted={dayCompletions.some((c) => c.habit_id === habit.id)}
                  onToggle={() => toggleCompletion(habit.id, selectedDay)}
                  disabled={!canEdit}
                />
              ))}
            </div>
          </div>
        )}

        {/* Weekly Goals */}
        {weeklyGoals.length > 0 && (
          <div>
            <h3 className="text-sm text-purple-200/70 mb-2 px-1">
              Metas Semanales
            </h3>
            <div className="space-y-2">
              {weeklyGoals.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompleted={dayCompletions.some((c) => c.habit_id === habit.id)}
                  onToggle={() => toggleCompletion(habit.id, selectedDay)}
                  disabled={!canEdit}
                />
              ))}
            </div>
          </div>
        )}

        {/* Future Day Message */}
        {isFuture && (
          <div className="text-center py-8 text-purple-200/50">
            <p>No puedes editar días futuros</p>
          </div>
        )}

        {/* No Habits Message */}
        {dayHabits.length === 0 && !isFuture && (
          <div className="text-center py-8 text-purple-200/50">
            <p>No hay hábitos programados para este día</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-purple-950/95 backdrop-blur-lg border-t border-purple-500/20 safe-bottom">
        <div className="flex items-center justify-around py-3 px-4">
          <button
            onClick={() => setSelectedDay(currentDayNumber)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
              isToday ? "text-purple-300" : "text-purple-400/60"
            }`}
          >
            <Flame className="w-6 h-6" />
            <span className="text-xs">Hoy</span>
          </button>

          <button
            onClick={onShowCalendar}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-purple-400/60 hover:text-purple-300 transition-colors"
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs">Calendario</span>
          </button>

          <button
            onClick={onShowStats}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-purple-400/60 hover:text-purple-300 transition-colors"
          >
            <BarChart2 className="w-6 h-6" />
            <span className="text-xs">Stats</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
