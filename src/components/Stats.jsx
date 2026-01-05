import { useMemo } from "react";
import {
  ArrowLeft,
  Flame,
  Target,
  TrendingUp,
  Award,
  Calendar,
  LogOut,
} from "lucide-react";
import ProgressRing from "./ProgressRing";

export default function Stats({
  challenge,
  currentDayNumber,
  streak,
  bestStreak,
  overallCompletion,
  getDayCompletionPercentage,
  onBack,
  onSignOut,
}) {
  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    if (!challenge) return [];

    const weeks = [];
    const totalWeeks = Math.ceil(challenge.duration / 7);

    for (let w = 0; w < totalWeeks; w++) {
      const startDay = w * 7 + 1;
      const endDay = Math.min((w + 1) * 7, challenge.duration);
      let totalPercentage = 0;
      let daysCount = 0;

      for (let d = startDay; d <= endDay; d++) {
        if (d <= currentDayNumber) {
          totalPercentage += getDayCompletionPercentage(d);
          daysCount++;
        }
      }

      weeks.push({
        week: w + 1,
        percentage: daysCount > 0 ? Math.round(totalPercentage / daysCount) : -1,
        completed: daysCount > 0,
      });
    }

    return weeks;
  }, [challenge, currentDayNumber, getDayCompletionPercentage]);

  // Count perfect days
  const perfectDays = useMemo(() => {
    let count = 0;
    for (let d = 1; d <= currentDayNumber; d++) {
      if (getDayCompletionPercentage(d) === 100) {
        count++;
      }
    }
    return count;
  }, [currentDayNumber, getDayCompletionPercentage]);

  const daysRemaining = (challenge?.duration || 75) - currentDayNumber;
  const progressPercentage = Math.round(
    (currentDayNumber / (challenge?.duration || 75)) * 100
  );

  return (
    <div className="min-h-screen flex flex-col safe-top safe-bottom">
      {/* Header */}
      <header className="px-4 pt-4 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Estadísticas</h1>
            <p className="text-sm text-purple-200/70">
              {challenge?.name || "75 Day Challenge"}
            </p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="p-2 rounded-xl hover:bg-white/10 text-purple-300 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 px-4 pb-6 overflow-y-auto">
        {/* Main Progress */}
        <div className="flex justify-center py-6">
          <ProgressRing percentage={overallCompletion} size={160} strokeWidth={14}>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">
                {overallCompletion}%
              </div>
              <div className="text-xs text-purple-200/70">Completado</div>
            </div>
          </ProgressRing>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Current Day */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-200/70">Día Actual</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">
                {currentDayNumber}
              </span>
              <span className="text-sm text-purple-200/50">
                / {challenge?.duration || 75}
              </span>
            </div>
          </div>

          {/* Days Remaining */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-pink-400" />
              <span className="text-xs text-purple-200/70">Días Restantes</span>
            </div>
            <div className="text-2xl font-bold text-white">{daysRemaining}</div>
          </div>

          {/* Current Streak */}
          <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl border border-orange-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-orange-200/70">Racha Actual</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-orange-300">{streak}</span>
              <span className="text-sm text-orange-200/50">días</span>
            </div>
          </div>

          {/* Best Streak */}
          <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-2xl border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-yellow-200/70">Mejor Racha</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-yellow-300">
                {bestStreak}
              </span>
              <span className="text-sm text-yellow-200/50">días</span>
            </div>
          </div>
        </div>

        {/* Perfect Days */}
        <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-200/70">Días Perfectos</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-green-300">
                  {perfectDays}
                </span>
                <span className="text-sm text-green-200/50">
                  de {currentDayNumber}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-300">
                {currentDayNumber > 0
                  ? Math.round((perfectDays / currentDayNumber) * 100)
                  : 0}
                %
              </div>
              <div className="text-xs text-green-200/50">tasa de éxito</div>
            </div>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="mb-6">
          <h3 className="text-sm text-purple-200/70 mb-3">Progreso Semanal</h3>
          <div className="space-y-2">
            {weeklyStats.slice(0, Math.ceil(currentDayNumber / 7) + 1).map((week) => (
              <div
                key={week.week}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
              >
                <span className="text-sm text-purple-200/70 w-16">
                  Semana {week.week}
                </span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  {week.completed && (
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        week.percentage >= 80
                          ? "bg-green-500"
                          : week.percentage >= 50
                          ? "bg-yellow-500"
                          : "bg-orange-500"
                      }`}
                      style={{ width: `${week.percentage}%` }}
                    />
                  )}
                </div>
                <span className="text-sm font-medium text-white w-12 text-right">
                  {week.completed ? `${week.percentage}%` : "-"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="p-4 bg-white/5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-200/70">Progreso Total</span>
            <span className="text-sm font-medium text-white">
              {progressPercentage}%
            </span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-purple-200/50 mt-2 text-center">
            {progressPercentage >= 100
              ? "¡Felicidades! Has completado el reto"
              : `${daysRemaining} días para completar tu ${challenge?.duration || 75} Day Challenge`}
          </p>
        </div>
      </div>
    </div>
  );
}
