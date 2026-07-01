import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { db } from '../services/db';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setCurrentUser(session.user);
        // Sync with public users table
        try {
          const syncedUser = await db.syncSupabaseUser(session.user);
          setDbUser(syncedUser);
        } catch (e) {
          console.error("Failed to sync user", e);
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setCurrentUser(session?.user || null);
      if (session?.user) {
        try {
          const syncedUser = await db.syncSupabaseUser(session.user);
          setDbUser(syncedUser);
        } catch (e) {
          console.error("Failed to sync user", e);
        }
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    currentUser,
    dbUser,     // This contains custom fields like alias, role
    loading,
    logout: () => supabase.auth.signOut(),
    updateAlias: async (newAlias) => {
      if (!currentUser) return;
      const updated = await db.updateUserAlias(currentUser.email, newAlias);
      setDbUser(updated);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
