/**
 * Neon Auth client for React Native.
 * Uses Better Auth–compatible HTTP API and expo-secure-store for JWT/session persistence.
 * Set EXPO_PUBLIC_NEON_AUTH_URL in apps/mobile/.env (from Neon Console → Auth → Configuration).
 */

import type { Session, User } from '@pivotly/types';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'pivotly_auth_session';
const BIOMETRIC_ENABLED_KEY = 'pivotly_biometric_enabled';

/** Auth base URL must be HTTPS (or HTTP in dev). Never use the database connection string (postgresql://). */
function getAuthBaseUrl(): string | null {
  const url = process.env.EXPO_PUBLIC_NEON_AUTH_URL;
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.replace(/\/$/, '');
  if (trimmed.startsWith('postgresql://') || trimmed.startsWith('postgres://')) {
    return null;
  }
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return null;
  }
  return trimmed;
}

/** Headers required by Better Auth when callbackURL is not an absolute URL (e.g. from mobile). */
function authHeaders(base: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Origin: base,
  };
}

/** Re-export shared auth types for code that still imports from this module. */
export type NeonAuthUser = User;
export type NeonAuthSession = Session;

type PersistOptions = { requireAuthentication?: boolean };

async function persistSession(session: Session, options?: PersistOptions): Promise<void> {
  const value = JSON.stringify(session);
  if (options?.requireAuthentication) {
    await SecureStore.setItemAsync(SESSION_KEY, value, {
      requireAuthentication: true,
      authenticationPrompt: 'Authenticate to unlock your session',
    });
  } else {
    await SecureStore.setItemAsync(SESSION_KEY, value);
  }
}

export async function clearStoredSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  } catch {
    // ignore
  }
  await setBiometricEnabled(false);
}

export async function getBiometricEnabled(): Promise<boolean> {
  try {
    const v = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return v === '1';
  } catch {
    return false;
  }
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  if (enabled) {
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, '1');
  } else {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
    } catch {
      // ignore
    }
  }
}

/**
 * Enable biometric protection for the session. Call after password login.
 * Re-stores the session with requireAuthentication so it can only be read after biometric auth.
 */
export async function enableBiometricForSession(session: Session): Promise<void> {
  await persistSession(session, { requireAuthentication: true });
  await setBiometricEnabled(true);
}

/**
 * Disable biometric protection. Re-stores session without biometric requirement.
 * Requires current session (from successful biometric auth or in-memory).
 */
export async function disableBiometricForSession(session: Session): Promise<void> {
  await persistSession(session, { requireAuthentication: false });
  await setBiometricEnabled(false);
}

export async function getStoredSession(): Promise<Session | null> {
  try {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.user?.id) return null;
    if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
      await clearStoredSession();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

type SignInResult = { ok: true; session: Session } | { ok: false; error: string };

export async function signInEmail(email: string, password: string): Promise<SignInResult> {
  const base = getAuthBaseUrl();
  if (!base) {
    return {
      ok: false,
      error: 'Auth not configured. In apps/mobile/.env set EXPO_PUBLIC_NEON_AUTH_URL to your Neon Auth HTTP URL (Neon Console → Auth → Configuration). Use an https:// URL, not the database connection string.',
    };
  }
  try {
    const res = await fetch(`${base}/sign-in/email`, {
      method: 'POST',
      headers: authHeaders(base),
      body: JSON.stringify({ email, password, callbackURL: base }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        (data?.message as string) ||
        (data?.error as string) ||
        (res.status === 401 ? 'Invalid email or password.' : 'Sign-in failed.');
      return { ok: false, error: msg };
    }
    const user = data?.user ?? data;
    const token = data?.token ?? data?.session?.token ?? data?.accessToken;
    const session: Session = {
      user: {
        id: String(user?.id ?? user?.userId ?? ''),
        email: String(user?.email ?? email),
        name: user?.name ?? undefined,
        image: user?.image ?? undefined,
      },
      token: token ?? undefined,
      accessToken: token ?? undefined,
      expiresAt: typeof data?.expiresAt === 'number' ? data.expiresAt : undefined,
    };
    if (session.user.id) {
      await persistSession(session);
    }
    return { ok: true, session };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Network error. Please try again.';
    return { ok: false, error: message };
  }
}

export async function signUpEmail(
  email: string,
  password: string,
  name?: string
): Promise<SignInResult> {
  const base = getAuthBaseUrl();
  if (!base) {
    return {
      ok: false,
      error: 'Auth not configured. In apps/mobile/.env set EXPO_PUBLIC_NEON_AUTH_URL to your Neon Auth HTTP URL (Neon Console → Auth → Configuration). Use an https:// URL, not the database connection string.',
    };
  }
  try {
    const res = await fetch(`${base}/sign-up/email`, {
      method: 'POST',
      headers: authHeaders(base),
      body: JSON.stringify({
        email,
        password,
        name: name || email.split('@')[0] || 'User',
        callbackURL: base,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        (data?.message as string) ||
        (data?.error as string) ||
        (res.status === 409 ? 'An account with this email already exists.' : 'Sign-up failed.');
      return { ok: false, error: msg };
    }
    const user = data?.user ?? data;
    const token = data?.token ?? data?.session?.token ?? data?.accessToken;
    const session: Session = {
      user: {
        id: String(user?.id ?? user?.userId ?? ''),
        email: String(user?.email ?? email),
        name: user?.name ?? name ?? undefined,
        image: user?.image ?? undefined,
      },
      token: token ?? undefined,
      accessToken: token ?? undefined,
      expiresAt: typeof data?.expiresAt === 'number' ? data.expiresAt : undefined,
    };
    if (session.user.id) {
      await persistSession(session);
    }
    return { ok: true, session };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Network error. Please try again.';
    return { ok: false, error: message };
  }
}

export type ForgotPasswordResult = { ok: true } | { ok: false; error: string };

/**
 * URL where the user lands when they click the reset link in the email.
 * Must be a trusted domain in Neon Auth (e.g. https://pivotlly.com/reset-password).
 * Set EXPO_PUBLIC_PASSWORD_RESET_REDIRECT_URL in .env to override.
 * That page should redirect to pivotly://reset-password?token=... to open the app.
 */
function getPasswordResetRedirectUrl(): string {
  const url = process.env.EXPO_PUBLIC_PASSWORD_RESET_REDIRECT_URL;
  if (url && typeof url === 'string' && url.startsWith('http')) return url.replace(/\/$/, '');
  return 'https://pivotlly.com/reset-password';
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResult> {
  const base = getAuthBaseUrl();
  if (!base) {
    return {
      ok: false,
      error: 'Auth not configured. Set EXPO_PUBLIC_NEON_AUTH_URL in apps/mobile/.env.',
    };
  }
  try {
    // redirectTo: must be a trusted domain in Neon (e.g. pivotlly.com). That page should redirect to pivotly://reset-password?token=...
    const res = await fetch(`${base}/request-password-reset`, {
      method: 'POST',
      headers: authHeaders(base),
      body: JSON.stringify({
        email: email.trim(),
        redirectTo: getPasswordResetRedirectUrl(),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        (data?.message as string) ||
        (data?.error as string) ||
        (data?.errors?.[0] as string) ||
        (res.status === 500
          ? 'Password reset is not configured. Check Neon Auth email/SMTP settings.'
          : `Failed to send reset email (${res.status}). Please try again.`);
      return { ok: false, error: msg };
    }
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Network error. Please try again.';
    return { ok: false, error: message };
  }
}

export type ResetPasswordResult = { ok: true } | { ok: false; error: string };

/**
 * Complete password reset with the token from the email link.
 * Better Auth: POST /reset-password
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<ResetPasswordResult> {
  const base = getAuthBaseUrl();
  if (!base) {
    return {
      ok: false,
      error: 'Auth not configured. Set EXPO_PUBLIC_NEON_AUTH_URL in apps/mobile/.env.',
    };
  }
  if (!token.trim()) {
    return { ok: false, error: 'Reset token is missing.' };
  }
  if (!newPassword || newPassword.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' };
  }
  try {
    const res = await fetch(`${base}/reset-password`, {
      method: 'POST',
      headers: authHeaders(base),
      body: JSON.stringify({ token: token.trim(), newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    const msg =
      (data?.message as string) ||
      (data?.error as string) ||
      (data?.errors?.[0] as string);
    if (!res.ok) {
      return {
        ok: false,
        error: msg || (res.status === 400 ? 'Invalid or expired link. Request a new reset.' : `Reset failed (${res.status}).`),
      };
    }
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Network error. Please try again.';
    return { ok: false, error: message };
  }
}

export async function signOut(): Promise<void> {
  const base = getAuthBaseUrl();
  if (base) {
    try {
      await fetch(`${base}/sign-out`, {
        method: 'POST',
        headers: authHeaders(base),
        body: '{}',
      });
    } catch {
      // ignore
    }
  }
  await clearStoredSession();
}

/**
 * Returns current session from storage, or tries to validate with the server if you have a token.
 */
export async function getSession(): Promise<Session | null> {
  const stored = await getStoredSession();
  if (stored) return stored;
  const base = getAuthBaseUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/get-session`, {
      method: 'GET',
      headers: authHeaders(base),
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => ({}));
    const user = data?.user ?? data;
    if (!user?.id) return null;
    const session: Session = {
      user: {
        id: String(user.id),
        email: String(user.email ?? ''),
        name: user.name ?? undefined,
        image: user.image ?? undefined,
      },
      token: data?.token ?? data?.session?.token,
      accessToken: data?.token ?? data?.accessToken,
      expiresAt: typeof data?.expiresAt === 'number' ? data.expiresAt : undefined,
    };
    await persistSession(session);
    return session;
  } catch {
    return null;
  }
}
