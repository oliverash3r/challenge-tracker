import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { useChallenge } from "./hooks/useChallenge";
import Auth from "./components/Auth";
import ChallengeSetup from "./components/ChallengeSetup";
import DayView from "./components/DayView";
import Calendar from "./components/Calendar";
import Stats from "./components/Stats";
import { Loader2 } from "lucide-react";

// Views
const VIEWS = {
  DAY: "day",
  CALENDAR: "calendar",
  STATS: "stats",
};

function App() {
  const { user, loading: authLoading, error: authError, signIn, signUp, signOut } = useAuth();
  const {
    challenge,
    habits,
    completions,
    loading: challengeLoading,
    createChallenge,
    toggleCompletion,
    getCurrentDayNumber,
    getHabitsForDay,
    getCompletionsForDay,
    getDayCompletionPercentage,
    calculateStreak,
    calculateBestStreak,
    calculateOverallCompletion,
  } = useChallenge(user?.id);

  const [currentView, setCurrentView] = useState(VIEWS.DAY);
  const [selectedDay, setSelectedDay] = useState(null);

  // Update current day number
  const currentDayNumber = getCurrentDayNumber();
  const streak = calculateStreak();
  const bestStreak = calculateBestStreak();
  const overallCompletion = calculateOverallCompletion();

  // Reset selected day when changing views
  useEffect(() => {
    if (currentView === VIEWS.DAY && selectedDay !== null) {
      setSelectedDay(null);
    }
  }, [currentView, selectedDay]);

  const handleAuth = async (email, password, isLogin) => {
    if (isLogin) {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
  };

  const handleCreateChallenge = async (name, duration, habits) => {
    await createChallenge(name, duration, habits);
  };

  const handleSelectDay = (day) => {
    setSelectedDay(day);
    setCurrentView(VIEWS.DAY);
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-purple-200/70">Cargando...</p>
        </div>
      </div>
    );
  }

  // Auth screen
  if (!user) {
    return <Auth onAuth={handleAuth} loading={authLoading} error={authError} />;
  }

  // Challenge setup
  if (!challenge && !challengeLoading) {
    return (
      <ChallengeSetup onComplete={handleCreateChallenge} loading={challengeLoading} />
    );
  }

  // Challenge loading
  if (challengeLoading && !challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-purple-200/70">Cargando tu reto...</p>
        </div>
      </div>
    );
  }

  // Main app views
  return (
    <>
      {currentView === VIEWS.DAY && (
        <DayView
          challenge={challenge}
          habits={habits}
          completions={completions}
          currentDayNumber={currentDayNumber}
          getHabitsForDay={getHabitsForDay}
          getCompletionsForDay={getCompletionsForDay}
          getDayCompletionPercentage={getDayCompletionPercentage}
          toggleCompletion={toggleCompletion}
          streak={streak}
          selectedDay={selectedDay}
          onShowCalendar={() => setCurrentView(VIEWS.CALENDAR)}
          onShowStats={() => setCurrentView(VIEWS.STATS)}
        />
      )}

      {currentView === VIEWS.CALENDAR && (
        <Calendar
          challenge={challenge}
          currentDayNumber={currentDayNumber}
          getDayCompletionPercentage={getDayCompletionPercentage}
          onSelectDay={handleSelectDay}
          onBack={() => setCurrentView(VIEWS.DAY)}
        />
      )}

      {currentView === VIEWS.STATS && (
        <Stats
          challenge={challenge}
          currentDayNumber={currentDayNumber}
          streak={streak}
          bestStreak={bestStreak}
          overallCompletion={overallCompletion}
          getDayCompletionPercentage={getDayCompletionPercentage}
          onBack={() => setCurrentView(VIEWS.DAY)}
          onSignOut={signOut}
        />
      )}
    </>
  );
}

export default App;
