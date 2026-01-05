import { useState, useEffect, useCallback } from "react";

const USER_KEY = "challenge_tracker_user";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signIn = useCallback(async (username) => {
    const userData = {
      id: username.toLowerCase(),
      username: username,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return {
    user,
    loading,
    error: null,
    signIn,
    signOut,
  };
}
