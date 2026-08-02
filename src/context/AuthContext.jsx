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
    let isMounted = true;

    const syncUser = async (user) => {
      if (!user) {
        if (isMounted) setDbUser(null);
        return;
      }
      try {
        const syncedUser = await db.syncSupabaseUser(user);
        if (isMounted) setDbUser(syncedUser);
      } catch (e) {
        console.error("Failed to sync user from database, using local fallback", e);
        if (isMounted) {
          setDbUser(prev => prev || {
            email: user.email,
            alias: user.user_metadata?.alias || user.email?.split('@')[0] || 'User',
            role: 'user'
          });
        }
      }
    };

    // Check active sessions and set user quickly
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && isMounted) {
          setCurrentUser(session.user);
          // Sync with public users table in background
          syncUser(session.user);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    // Safety timeout: never leave loading true for longer than 800ms
    const safetyTimer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 800);

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      setCurrentUser(session?.user || null);
      if (session?.user) {
        syncUser(session.user);
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    dbUser,     // This contains custom fields like alias, role
    loading,
    logout: () => {
      setCurrentUser(null);
      setDbUser(null);
      return supabase.auth.signOut();
    },
    updateAlias: async (newAlias) => {
      if (!currentUser) return;
      const updated = await db.updateUserAlias(currentUser.email, newAlias);
      setDbUser(updated);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
