import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase';

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  userId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const client = getSupabase();

    // 1. Initial check using getSession
    client.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          console.warn('[AuthProvider] getSession error:', error.message);
        }
        if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);
        } else {
          setSession(null);
          setUser(null);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('[AuthProvider] getSession exception:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    // 2. Subscribe to auth state changes
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        setIsDemoMode(false);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const client = getSupabase();
      await client.auth.signOut();
    } catch (err) {
      console.warn('[AuthProvider] signOut error:', err);
    } finally {
      setSession(null);
      setUser(null);
      setIsDemoMode(false);
    }
  };

  const refreshSession = async () => {
    try {
      const client = getSupabase();
      const { data } = await client.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
    } catch (err) {
      console.warn('[AuthProvider] refreshSession error:', err);
    }
  };

  const isAuthenticated = Boolean(session?.user) || isDemoMode;
  const userId = session?.user?.id ?? (isDemoMode ? 'demo-user-id' : null);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        userId,
        isLoading,
        isAuthenticated,
        isDemoMode,
        setDemoMode: setIsDemoMode,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
