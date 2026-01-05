import { useMemo } from "react";
import { ArrowLeft, Flame } from "lucide-react";

export default function Calendar({
  challenge,
  currentDayNumber,
  getDayCompletionPercentage,
  onSelectDay,
  onBack,
}) {
  const days = useMemo(() => {
    if (!challenge) return [];

    const result = [];
    for (let i = 1; i <= challenge.duration; i++) {
      const percentage = i <= currentDayNumber ? getDayCompletionPercentage(i) : -1;
      result.push({
        day: i,
        percentage,
        isToday: i === currentDayNumber,
        isFuture: i > currentDayNumber,
      });
    }
    return result;
  }, [challenge, currentDayNumber, getDayCompletionPercentage]);

  const getColorClass = (percentage, isToday, isFuture) => {
    if (isFuture) return "bg-white/5 text-purple-300/30";
    if (isToday) return "ring-2 ring-purple-400 ring-offset-2 ring-offset-purple-950";

    if (percentage === -1) return "bg-white/5 text-purple-300/30";
    if (percentage === 100) return "bg-green-500/80 text-white";
    if (percentage >= 70) return "bg-yellow-500/80 text-white";
    if (percentage >= 40) return "bg-orange-500/80 text-white";
    if (percentage > 0) return "bg-red-500/80 text-white";
    return "bg-gray-500/50 text-white/70";
  };

  const getBackgroundColor = (percentage, isFuture) => {
    if (isFuture || percentage === -1) return "transparent";
    if (percentage === 100) return "rgba(34, 197, 94, 0.8)";
    if (percentage >= 70) return "rgba(234, 179, 8, 0.8)";
    if (percentage >= 40) return "rgba(249, 115, 22, 0.8)";
    if (percentage > 0) return "rgba(239, 68, 68, 0.8)";
    return "rgba(107, 114, 128, 0.5)";
  };

  // Calculate weeks
  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  return (
    <div className="min-h-screen flex flex-col safe-top safe-bottom">
      {/* Header */}
      <header className="px-4 pt-4 pb-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Calendario</h1>
          <p className="text-sm text-purple-200/70">
            {challenge?.name || "75 Day Challenge"}
          </p>
        </div>
      </header>

      {/* Legend */}
      <div className="px-4 mb-4">
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-green-500/80" />
            <span className="text-purple-200/70">100%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-yellow-500/80" />
            <span className="text-purple-200/70">70%+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-orange-500/80" />
            <span className="text-purple-200/70">40%+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-red-500/80" />
            <span className="text-purple-200/70">&lt;40%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-gray-500/50" />
            <span className="text-purple-200/70">0%</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 px-4 pb-6 overflow-y-auto">
        <div className="space-y-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1.5">
              {/* Week number */}
              <div className="w-8 flex items-center justify-center text-xs text-purple-300/50">
                S{weekIndex + 1}
              </div>

              {/* Days */}
              <div className="flex-1 grid grid-cols-7 gap-1.5">
                {week.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => !day.isFuture && onSelectDay(day.day)}
                    disabled={day.isFuture}
                    className={`
                      aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                      transition-all duration-200 relative
                      ${getColorClass(day.percentage, day.isToday, day.isFuture)}
                      ${!day.isFuture ? "active:scale-95 cursor-pointer" : "cursor-not-allowed"}
                    `}
                    style={{
                      backgroundColor: getBackgroundColor(day.percentage, day.isFuture),
                    }}
                  >
                    {day.day}
                    {day.isToday && (
                      <Flame className="absolute -top-1 -right-1 w-3 h-3 text-orange-400" />
                    )}
                  </button>
                ))}
                {/* Fill remaining cells in last week */}
                {week.length < 7 &&
                  Array(7 - week.length)
                    .fill(null)
                    .map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Summary */}
        <div className="mt-6 p-4 bg-white/5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-purple-200/70">Progreso del reto</span>
            <span className="font-semibold text-white">
              {currentDayNumber} / {challenge?.duration || 75} días
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{
                width: `${((currentDayNumber) / (challenge?.duration || 75)) * 100}%`,
              }}
            />
          </div>
          <div className="text-right mt-1">
            <span className="text-xs text-purple-200/50">
              {challenge?.duration - currentDayNumber} días restantes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
