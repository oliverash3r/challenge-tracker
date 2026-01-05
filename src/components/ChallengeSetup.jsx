import { useState } from "react";
import {
  Flame,
  Plus,
  Trash2,
  GripVertical,
  Loader2,
  ChevronDown,
  Check,
} from "lucide-react";

const DEFAULT_HABITS = [
  { name: "Levantarme temprano", sublabel: "7:00 AM", frequency: "daily", is_weekly_goal: false },
  { name: "Comida saludable", sublabel: "", frequency: "daily", is_weekly_goal: false },
  { name: "Lectura", sublabel: "", frequency: "daily", is_weekly_goal: false },
  { name: "Meditar", sublabel: "", frequency: "daily", is_weekly_goal: false },
  { name: "Oración / Biblia", sublabel: "", frequency: "daily", is_weekly_goal: false },
  { name: "Learning progress", sublabel: "", frequency: "daily", is_weekly_goal: false },
  { name: "Acostarme temprano", sublabel: "10:45 PM", frequency: "daily", is_weekly_goal: false },
  { name: "Ejercicio", sublabel: "3x semana", frequency: "weekly", specific_days: [1, 3, 5], is_weekly_goal: true },
  { name: "Church", sublabel: "", frequency: "specific_days", specific_days: [0], is_weekly_goal: false },
];

const DURATION_OPTIONS = [21, 30, 60, 75, 90, 100];
const DAYS_OF_WEEK = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function ChallengeSetup({ onComplete, loading }) {
  const [name, setName] = useState("75 Day Challenge");
  const [duration, setDuration] = useState(75);
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [editingHabit, setEditingHabit] = useState(null);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  const addHabit = () => {
    setHabits([
      ...habits,
      { name: "", sublabel: "", frequency: "daily", is_weekly_goal: false },
    ]);
    setEditingHabit(habits.length);
  };

  const updateHabit = (index, updates) => {
    const newHabits = [...habits];
    newHabits[index] = { ...newHabits[index], ...updates };
    setHabits(newHabits);
  };

  const removeHabit = (index) => {
    setHabits(habits.filter((_, i) => i !== index));
    setEditingHabit(null);
  };

  const toggleDay = (habitIndex, day) => {
    const habit = habits[habitIndex];
    const currentDays = habit.specific_days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort();
    updateHabit(habitIndex, { specific_days: newDays });
  };

  const handleSubmit = () => {
    const validHabits = habits.filter((h) => h.name.trim());
    if (validHabits.length === 0) return;

    onComplete(name, duration, validHabits);
  };

  return (
    <div className="min-h-screen px-4 py-6 safe-top safe-bottom">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-3">
          <Flame className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Configura tu Reto</h1>
        <p className="text-purple-200/70 mt-1">Personaliza tus hábitos diarios</p>
      </div>

      {/* Challenge Name */}
      <div className="mb-4">
        <label className="block text-sm text-purple-200/70 mb-2">
          Nombre del reto
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400"
        />
      </div>

      {/* Duration */}
      <div className="mb-6">
        <label className="block text-sm text-purple-200/70 mb-2">Duración</label>
        <div className="relative">
          <button
            onClick={() => setShowDurationPicker(!showDurationPicker)}
            className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white text-left flex items-center justify-between"
          >
            <span>{duration} días</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                showDurationPicker ? "rotate-180" : ""
              }`}
            />
          </button>
          {showDurationPicker && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-purple-900/95 border border-purple-400/30 rounded-xl overflow-hidden z-10 backdrop-blur-lg">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDuration(d);
                    setShowDurationPicker(false);
                  }}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white/10 transition-colors ${
                    duration === d ? "bg-purple-500/30" : ""
                  }`}
                >
                  <span>{d} días</span>
                  {duration === d && <Check className="w-4 h-4 text-green-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Habits */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm text-purple-200/70">Hábitos</label>
          <button
            onClick={addHabit}
            className="flex items-center gap-1 text-sm text-purple-300 hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>

        <div className="space-y-2">
          {habits.map((habit, index) => (
            <div
              key={index}
              className={`bg-white/5 border rounded-xl overflow-hidden transition-all ${
                editingHabit === index
                  ? "border-purple-400"
                  : "border-white/10"
              }`}
            >
              {/* Habit Row */}
              <div
                onClick={() =>
                  setEditingHabit(editingHabit === index ? null : index)
                }
                className="flex items-center gap-3 p-3 cursor-pointer"
              >
                <GripVertical className="w-4 h-4 text-purple-300/50 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  {editingHabit === index ? (
                    <input
                      type="text"
                      value={habit.name}
                      onChange={(e) =>
                        updateHabit(index, { name: e.target.value })
                      }
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Nombre del hábito"
                      className="w-full bg-transparent text-white placeholder-purple-300/50 focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className="text-white">
                      {habit.name || "Nuevo hábito"}
                    </span>
                  )}
                  {habit.sublabel && editingHabit !== index && (
                    <span className="text-sm text-purple-300/70 ml-2">
                      ({habit.sublabel})
                    </span>
                  )}
                </div>
                <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-200 rounded-full flex-shrink-0">
                  {habit.frequency === "daily"
                    ? "Diario"
                    : habit.frequency === "weekly"
                    ? "Semanal"
                    : "Días específicos"}
                </span>
              </div>

              {/* Expanded Edit */}
              {editingHabit === index && (
                <div className="px-3 pb-3 space-y-3 border-t border-white/10 pt-3">
                  {/* Sublabel */}
                  <input
                    type="text"
                    value={habit.sublabel || ""}
                    onChange={(e) =>
                      updateHabit(index, { sublabel: e.target.value })
                    }
                    placeholder="Nota/hora (opcional)"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-300/50 text-sm focus:outline-none focus:border-purple-400"
                  />

                  {/* Frequency */}
                  <div className="flex gap-2">
                    {[
                      { value: "daily", label: "Diario" },
                      { value: "weekly", label: "Semanal" },
                      { value: "specific_days", label: "Días" },
                    ].map((freq) => (
                      <button
                        key={freq.value}
                        onClick={() =>
                          updateHabit(index, {
                            frequency: freq.value,
                            specific_days:
                              freq.value !== "daily" ? habit.specific_days || [] : null,
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

                  {/* Day Picker */}
                  {(habit.frequency === "weekly" ||
                    habit.frequency === "specific_days") && (
                    <div className="flex gap-1">
                      {DAYS_OF_WEEK.map((day, dayIndex) => (
                        <button
                          key={day}
                          onClick={() => toggleDay(index, dayIndex)}
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

                  {/* Weekly Goal Toggle */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      className={`w-10 h-6 rounded-full transition-colors relative ${
                        habit.is_weekly_goal ? "bg-purple-500" : "bg-white/20"
                      }`}
                      onClick={() =>
                        updateHabit(index, { is_weekly_goal: !habit.is_weekly_goal })
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

                  {/* Delete */}
                  <button
                    onClick={() => removeHabit(index)}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar hábito
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || habits.filter((h) => h.name.trim()).length === 0}
        className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creando...
          </>
        ) : (
          <>
            <Flame className="w-5 h-5" />
            Comenzar Reto
          </>
        )}
      </button>
    </div>
  );
}
