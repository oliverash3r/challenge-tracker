import { useState } from "react";
import { Flame, User, Loader2 } from "lucide-react";

export default function Auth({ onAuth, loading }) {
  const [username, setUsername] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!username) {
      setLocalError("Por favor ingresa tu nombre");
      return;
    }

    if (username.length < 2) {
      setLocalError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    try {
      await onAuth(username);
    } catch (err) {
      // Error is handled by parent
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Flame className="w-14 h-14 text-white" />
          </div>
          <span className="absolute -bottom-1 -right-1 bg-white text-purple-700 font-bold text-sm px-2 py-0.5 rounded-full">
            75
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-white">75 Day Challenge</h1>
        <p className="mt-2 text-purple-200/70">¿Cómo te llamas?</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        {/* Username */}
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
          <input
            type="text"
            placeholder="Tu nombre"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, ''))}
            autoCapitalize="words"
            autoCorrect="off"
            className="w-full pl-12 pr-4 py-4 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
          />
        </div>

        {/* Error */}
        {localError && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm text-center">
            {localError}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Cargando...
            </>
          ) : (
            "Comenzar"
          )}
        </button>
      </form>
    </div>
  );
}
