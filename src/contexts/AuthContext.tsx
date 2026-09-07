import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import type { UserRole } from '../types/auth';

interface AuthState {
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  needsProfile: boolean;
}

type AuthAction =
  | { type: 'RESTORE_SESSION'; session: Session | null; needsProfile: boolean }
  | { type: 'SIGN_IN'; session: Session }
  | { type: 'UPDATE_SESSION'; session: Session }
  | { type: 'SIGN_OUT' }
  | { type: 'PROFILE_COMPLETE' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'RESTORE_SESSION':
      return {
        isLoading: false,
        session: action.session,
        user: action.session?.user ?? null,
        needsProfile: action.needsProfile,
      };
    case 'SIGN_IN':
      return { ...state, session: action.session, user: action.session.user, isLoading: false };
    case 'UPDATE_SESSION':
      return { ...state, session: action.session, user: action.session.user };
    case 'SIGN_OUT':
      return { isLoading: false, session: null, user: null, needsProfile: false };
    case 'PROFILE_COMPLETE':
      return { ...state, needsProfile: false };
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  signUp: (email: string, password: string, role: UserRole, fullName: string, phone: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  completeProfile: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    isLoading: true,
    session: null,
    user: null,
    needsProfile: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        // Refresh session to get latest user_metadata from server
        const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
        const session = refreshedSession ?? (await supabase.auth.getSession()).data.session;
        let needsProfile = false;

        if (session?.user) {
          const role = session.user.user_metadata?.role as UserRole | undefined;
          if (role === 'teacher') {
            const { data } = await supabase
              .from('teachers')
              .select('profile_id')
              .eq('profile_id', session.user.id)
              .single();
            needsProfile = !data;
          }
        }

        if (!cancelled) {
          dispatch({ type: 'RESTORE_SESSION', session, needsProfile });
        }
      } catch {
        if (!cancelled) {
          dispatch({ type: 'RESTORE_SESSION', session: null, needsProfile: false });
        }
      }
    }

    restore();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        dispatch({ type: 'UPDATE_SESSION', session });
      } else {
        dispatch({ type: 'SIGN_OUT' });
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, role: UserRole, fullName: string, phone: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone_number: phone, role },
      },
    });
    if (error) throw error;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session) {
      dispatch({ type: 'SIGN_IN', session: data.session });
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'SIGN_OUT' });
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }, []);

  const completeProfile = useCallback(() => {
    dispatch({ type: 'PROFILE_COMPLETE' });
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    state,
    signUp,
    signIn,
    signOut,
    resetPassword,
    completeProfile,
  }), [state, signUp, signIn, signOut, resetPassword, completeProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
