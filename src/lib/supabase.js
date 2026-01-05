import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Offline queue for completions
const QUEUE_KEY = "offline_completions_queue";

export const offlineQueue = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    } catch {
      return [];
    }
  },

  add(item) {
    const queue = this.get();
    queue.push({ ...item, timestamp: Date.now() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  clear() {
    localStorage.removeItem(QUEUE_KEY);
  },

  async sync() {
    const queue = this.get();
    if (queue.length === 0) return;

    const errors = [];
    for (const item of queue) {
      try {
        if (item.action === "complete") {
          await supabase.from("completions").insert({
            habit_id: item.habit_id,
            day_number: item.day_number,
          });
        } else if (item.action === "uncomplete") {
          await supabase
            .from("completions")
            .delete()
            .eq("habit_id", item.habit_id)
            .eq("day_number", item.day_number);
        }
      } catch (err) {
        errors.push(item);
      }
    }

    if (errors.length > 0) {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(errors));
    } else {
      this.clear();
    }
  }
};

// Sync when online
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    offlineQueue.sync();
  });
}
