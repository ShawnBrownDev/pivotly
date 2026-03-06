/**
 * Auth context backed by Neon Auth. JWT/session stored in expo-secure-store.
 * Supports biometric login (Face ID, Touch ID, Fingerprint) when enabled.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  disableBiometricForSession,
  enableBiometricForSession,
  getBiometricEnabled,
  getSession,
  getStoredSession,
  signInEmail,
  signOut as clientSignOut,
  signUpEmail,
} from '@/lib/neon-auth-client';
import { setAuthTokenGetter } from '@/lib/api-client';
import type { BiometricStatus } from '@/lib/biometric';
import {
  authenticate as biometricAuthenticate,
  getBiometricStatus,
} from '@/lib/biometric';
import type { Session } from '@pivotly/types';

export type AuthUser = {
  id: string;
  email: string;
  username?: string;
  name?: string;
  image?: string;
} | null;

type AuthContextValue = {
  user: AuthUser;
  loading: boolean;
  biometricStatus: BiometricStatus | null;
  biometricEnabled: boolean;
  signIn: (email: string, password: string) => Promise<Session | null>;
  signUp: (email: string, password: string, username?: string) => Promise<Session | null>;
  signOut: () => Promise<void>;
  tryBiometricLogin: () => Promise<boolean>;
  enableBiometric: (session: Session) => Promise<{ success: boolean; error?: string }>;
  disableBiometric: () => Promise<void>;
  error: string | null;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(u: { id: string; email: string; name?: string; image?: string } | null): AuthUser {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    username: u.name ?? u.email.split('@')[0],
    name: u.name,
    image: u.image,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus | null>(null);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    setAuthTokenGetter(() =>
      getStoredSession().then((s) => s?.accessToken ?? s?.token ?? null)
    );
    let cancelled = false;
    (async () => {
      try {
        const [status, enabled] = await Promise.all([
          getBiometricStatus(),
          getBiometricEnabled(),
        ]);
        if (cancelled) return;
        setBiometricStatus(status);
        setBiometricEnabledState(enabled);

        if (enabled) {
          try {
            const stored = await getStoredSession();
            if (cancelled) return;
            if (stored?.user) {
              setUser(toAuthUser(stored.user));
              setLoading(false);
              return;
            }
          } catch {
            if (!cancelled) setUser(null);
          }
          if (!cancelled) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        const stored = await getStoredSession();
        if (cancelled) return;
        if (stored?.user) {
          setUser(toAuthUser(stored.user));
          setLoading(false);
          return;
        }
        const session = await getSession();
        if (cancelled) return;
        setUser(session ? toAuthUser(session.user) : null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<Session | null> => {
    setError(null);
    const result = await signInEmail(email, password);
    if (result.ok) {
      setUser(toAuthUser(result.session.user));
      return result.session;
    }
    setError(result.error);
    throw new Error(result.error);
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, username?: string): Promise<Session | null> => {
      setError(null);
      const result = await signUpEmail(email, password, username);
      if (result.ok) {
        setUser(toAuthUser(result.session.user));
        return result.session;
      }
      setError(result.error);
      throw new Error(result.error);
    },
    []
  );

  const signOut = useCallback(async () => {
    setError(null);
    await clientSignOut();
    setUser(null);
    setBiometricEnabledState(false);
  }, []);

  const tryBiometricLogin = useCallback(async (): Promise<boolean> => {
    try {
      const stored = await getStoredSession();
      if (stored?.user) {
        setUser(toAuthUser(stored.user));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const enableBiometric = useCallback(
    async (session: Session): Promise<{ success: boolean; error?: string }> => {
      if (!biometricStatus?.available) {
        return {
          success: false,
          error: 'Biometric sign-in is not available on this device.',
        };
      }
      const label = biometricStatus.label;
      const { success } = await biometricAuthenticate({
        promptMessage: `Verify your identity to enable ${label}`,
        fallbackLabel: 'Use password',
      });
      if (!success) {
        return {
          success: false,
          error: 'Authentication was cancelled or failed. You can enable it later in Profile.',
        };
      }
      try {
        await enableBiometricForSession(session);
        setBiometricEnabledState(true);
        return { success: true };
      } catch {
        return {
          success: false,
          error: 'Could not save. Try again later or enable in Profile.',
        };
      }
    },
    [biometricStatus]
  );

  const disableBiometric = useCallback(async () => {
    try {
      const stored = await getStoredSession();
      if (stored) {
        await disableBiometricForSession(stored);
      }
      setBiometricEnabledState(false);
    } catch {
      setBiometricEnabledState(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      biometricStatus,
      biometricEnabled,
      signIn,
      signUp,
      signOut,
      tryBiometricLogin,
      enableBiometric,
      disableBiometric,
      error,
      clearError,
    }),
    [
      user,
      loading,
      biometricStatus,
      biometricEnabled,
      signIn,
      signUp,
      signOut,
      tryBiometricLogin,
      enableBiometric,
      disableBiometric,
      error,
      clearError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
