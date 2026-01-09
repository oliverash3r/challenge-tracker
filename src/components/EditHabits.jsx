import { useState } from "react";
import { ChevronLeft, Check, Target } from "lucide-react";

const WEEKLY_TARGET_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
const DAYS_OF_WEEK = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function EditHabits({ habits, onUpdateHabit, onBack }) {
  const [editingHabit, setEditingHabit] = useState(null);
  const [localHabits, setLocalHabits] = useState(habits);

  const updateLocalHabit = (habitId, updates) => {
    setLocalHabits(prev =>
      prev.map(h => (h.id === habitId ? { ...h, ...updates } : h))
    );
  };

  const toggleDay = (habitId, day) => {
    const habit = localHabits.find(h => h.id === habitId);
    const currentDays = habit.specific_days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();
    updateLocalHabit(habitId, { specific_days: newDays.length > 0 ? newDays : null });
  };

  const saveHabit = (habitId) => {
    const habit = localHabits.find(h => h.id === habitId);
    onUpdateHabit(habitId, {
      name: habit.name,
      sublabel: habit.sublabel,
      is_weekly_goal: habit.is_weekly_goal,
      weekly_target: habit.weekly_target,
      frequency: habit.frequency,
      specific_days: habit.specific_days,
    });
    setEditingHabit(null);
  };

  return (
    <div className="min-h-screen px-4 py-6 safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white">Editar Hábitos</h1>
      </div>

      <p className="text-purple-200/70 text-sm mb-4">
        Modifica tus hábitos sin perder tu progreso
      </p>

      {/* Habits List */}
      <div className="space-y-2">
        {localHabits.map((habit) => (
          <div
            key={habit.id}
            className={`bg-white/5 border rounded-xl overflow-hidden transition-all ${
              editingHabit === habit.id
                ? "border-purple-400"
                : "border-white/10"
            }`}
          >
            {/* Habit Row */}
            <div
              onClick={() =>
                setEditingHabit(editingHabit === habit.id ? null : habit.id)
              }
              className="flex items-center gap-3 p-3 cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <span className="text-white">{habit.name}</span>
                {habit.sublabel && (
                  <span className="text-sm text-purple-300/70 ml-2">
                    ({habit.sublabel})
                  </span>
                )}
              </div>
              <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-200 rounded-full flex-shrink-0">
                {habit.is_weekly_goal
                  ? `${habit.weekly_target || 3}x/semana`
                  : habit.frequency === "daily"
                  ? "Diario"
                  : habit.specific_days?.length > 0
                  ? `${habit.specific_days.length} días`
                  : "Días específicos"}
              </span>
            </div>

            {/* Expanded Edit */}
            {editingHabit === habit.id && (
              <div className="px-3 pb-3 space-y-3 border-t border-white/10 pt-3">
                {/* Name */}
                <input
                  type="text"
                  value={habit.name}
                  onChange={(e) =>
                    updateLocalHabit(habit.id, { name: e.target.value })
                  }
                  placeholder="Nombre del hábito"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-300/50 text-sm focus:outline-none focus:border-purple-400"
                />

                {/* Sublabel */}
                <input
                  type="text"
                  value={habit.sublabel || ""}
                  onChange={(e) =>
                    updateLocalHabit(habit.id, { sublabel: e.target.value })
                  }
                  placeholder="Nota/hora (opcional)"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-300/50 text-sm focus:outline-none focus:border-purple-400"
                />

                {/* Weekly Goal Toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`w-10 h-6 rounded-full transition-colors relative ${
                      habit.is_weekly_goal ? "bg-purple-500" : "bg-white/20"
                    }`}
                    onClick={() =>
                      updateLocalHabit(habit.id, {
                        is_weekly_goal: !habit.is_weekly_goal,
                        frequency: !habit.is_weekly_goal ? "weekly" : "daily",
                        weekly_target: habit.weekly_target || 3,
                      })
                    }
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        habit.is_weekly_goal ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </div>
                  <span className="text-sm text-purple-200">Meta semanal</span>
                </label>

                {/* Weekly Target Selector - for weekly goals */}
                {habit.is_weekly_goal && (
                  <div>
                    <label className="text-sm text-purple-200/70 mb-2 block">
                      ¿Cuántas veces por semana?
                    </label>
                    <div className="flex gap-1">
                      {WEEKLY_TARGET_OPTIONS.map((target) => (
                        <button
                          key={target}
                          onClick={() =>
                            updateLocalHabit(habit.id, { weekly_target: target })
                          }
                          className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                            (habit.weekly_target || 3) === target
                              ? "bg-purple-500 text-white"
                              : "bg-white/5 text-purple-200 hover:bg-white/10"
                          }`}
                        >
                          {target}x
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Day Picker for weekly goals */}
                {habit.is_weekly_goal && (
                  <div>
                    <label className="text-sm text-purple-200/70 mb-2 block">
                      ¿Solo ciertos días? (opcional)
                    </label>
                    <div className="flex gap-1">
                      {DAYS_OF_WEEK.map((day, dayIndex) => (
                        <button
                          key={day}
                          onClick={() => toggleDay(habit.id, dayIndex)}
                          className={`flex-1 py-2 text-xs rounded-lg transition-colors ${
                            habit.specific_days?.includes(dayIndex)
                              ? "bg-purple-500 text-white"
                              : "bg-white/5 text-purple-200 hover:bg-white/10"
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-purple-300/50 mt-1">
                      Deja vacío para cualquier día (flexible)
                    </p>
                  </div>
                )}

                {/* Frequency - only for non-weekly-goals */}
                {!habit.is_weekly_goal && (
                  <div className="flex gap-2">
                    {[
                      { value: "daily", label: "Diario" },
                      { value: "specific_days", label: "Días específicos" },
                    ].map((freq) => (
                      <button
                        key={freq.value}
                        onClick={() =>
                          updateLocalHabit(habit.id, {
                            frequency: freq.value,
                            specific_days:
                              freq.value !== "daily"
                                ? habit.specific_days || []
                                : null,
                          })
                        }
                        className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                          habit.frequency === freq.value
                            ? "bg-purple-500 text-white"
                            : "bg-white/5 text-purple-200 hover:bg-white/10"
                        }`}
                      >
                        {freq.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Day Picker - only for specific_days frequency (non-weekly-goals) */}
                {!habit.is_weekly_goal && habit.frequency === "specific_days" && (
                  <div className="flex gap-1">
                    {DAYS_OF_WEEK.map((day, dayIndex) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(habit.id, dayIndex)}
                        className={`flex-1 py-2 text-xs rounded-lg transition-colors ${
                          habit.specific_days?.includes(dayIndex)
                            ? "bg-purple-500 text-white"
                            : "bg-white/5 text-purple-200 hover:bg-white/10"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                )}

                {/* Save Button */}
                <button
                  onClick={() => saveHabit(habit.id)}
                  className="w-full py-2 bg-green-500/20 border border-green-500/40 rounded-lg text-green-300 font-medium flex items-center justify-center gap-2 hover:bg-green-500/30 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Guardar cambios
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
