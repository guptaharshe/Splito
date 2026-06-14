import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { fetchApi } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null); // DB user with role
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session fetch
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        loadDbUser();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) {
        loadDbUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadDbUser() {
    try {
      const res = await fetchApi('/api/auth/me');
      setUser(res.user);
    } catch (e) {
      console.error('Failed to load user:', e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
