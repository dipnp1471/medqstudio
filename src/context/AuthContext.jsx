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
      try {
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
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
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
      } catch (err) {
        console.error("Auth state change error:", err);
      } finally {
        setLoading(false);
      }
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
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--color-bg, #090d16)', color: 'var(--color-text, #f8fafc)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontFamily: 'sans-serif' }}>Loading application...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
