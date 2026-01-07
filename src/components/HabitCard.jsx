import { useState } from "react";
import { Check, Clock, Target } from "lucide-react";

export default function HabitCard({
  habit,
  isCompleted,
  onToggle,
  disabled = false,
  weeklyProgress = null,
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    if (disabled) return;

    setIsAnimating(true);
    onToggle();

    setTimeout(() => setIsAnimating(false), 300);
  };

  const getIcon = () => {
    if (habit.is_weekly_goal) return Target;
    if (habit.sublabel) return Clock;
    return null;
  };

  const Icon = getIcon();

  // Check if weekly target is met
  const weeklyTargetMet = weeklyProgress && weeklyProgress.completed >= weeklyProgress.target;

  return (
    <button
      onClick={handleToggle}
      disabled={disabled}
      className={`
        w-full p-4 rounded-2xl text-left transition-all duration-200 no-select
        ${isCompleted
          ? "bg-gradient-to-r from-green-500/30 to-emerald-500/20 border border-green-500/40"
          : weeklyTargetMet
          ? "bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/30"
          : "bg-white/5 border border-white/10 hover:bg-white/10"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "active:scale-[0.98]"}
        ${isAnimating ? "animate-scale-up" : ""}
      `}
    >
      <div className="flex items-center gap-3">
        {/* Checkbox */}
        <div
          className={`
            w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200
            ${isCompleted
              ? "bg-green-500 border-green-500"
              : "border-purple-400/50 bg-transparent"
            }
            ${isAnimating && isCompleted ? "animate-check" : ""}
          `}
        >
          {isCompleted && (
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`
                font-medium transition-all duration-200
                ${isCompleted ? "text-green-300" : "text-white"}
              `}
            >
              {habit.name}
            </span>
            {habit.is_weekly_goal && weeklyProgress && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  weeklyProgress.completed >= weeklyProgress.target
                    ? "bg-green-500/30 text-green-200"
                    : "bg-purple-500/30 text-purple-200"
                }`}
              >
                {weeklyProgress.completed}/{weeklyProgress.target} esta semana
              </span>
            )}
          </div>
          {habit.sublabel && (
            <div className="flex items-center gap-1 mt-0.5">
              {Icon && <Icon className="w-3 h-3 text-purple-300/70" />}
              <span className="text-sm text-purple-300/70">{habit.sublabel}</span>
            </div>
          )}
        </div>

        {/* Visual indicator */}
        {isCompleted && (
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        )}
      </div>
    </button>
  );
}
