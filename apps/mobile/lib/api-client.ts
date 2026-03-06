/**
 * Centralized Pivotly API client for authenticated requests.
 *
 * - Attaches Authorization: Bearer <token> from SecureStore (token getter set by AuthProvider).
 * - On 401: runs global callback (signOut + redirect to /main + optional alert); no token logging.
 *
 * Set EXPO_PUBLIC_API_URL in apps/mobile/.env (e.g. http://localhost:3000).
 *
 * Usage:
 *   - Prefer high-level helpers (e.g. syncProfile) when available.
 *   - For new endpoints use authenticatedFetch('/path', { method: 'POST', body: JSON.stringify(...) }),
 *     then catch ApiAuthError and return { ok: false, error: e.message } so UI doesn’t double-handle 401.
 *   - For public endpoints use authenticatedFetch('/path', { skipAuth: true }).
 * See docs/api-client-auth.md for 401 flow and examples.
 */

import type { CommentDto, IdeaDto } from '@pivotly/types';

export type ProfileDto = {
  id: string;
  email: string;
  username: string;
  created_at: string;
};

export type SyncProfileResult =
  | { ok: true; profile: ProfileDto }
  | { ok: false; error: string };

/** Thrown when the API returns 401; global handler runs before this is thrown. */
export class ApiAuthError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiAuthError';
  }
}

function getApiBaseUrl(): string | null {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.replace(/\/$/, '');
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return null;
  return trimmed;
}

// Injected by app: token from SecureStore (set in AuthProvider).
let authTokenGetter: (() => Promise<string | null>) | null = null;

// Injected by app: signOut + redirect + optional alert (set in root layout).
let on401Callback: (() => void) | null = null;

/**
 * Register the function used to get the current access token (e.g. from SecureStore).
 * Call from AuthProvider on mount so all authenticated requests can attach the token.
 */
export function setAuthTokenGetter(getter: () => Promise<string | null>): void {
  authTokenGetter = getter;
}

/**
 * Register the handler for 401 responses (signOut, redirect to /main, optional "Session expired" alert).
 * Call from root layout so the callback has access to useAuth().signOut and useRouter().replace.
 */
export function setOn401Callback(callback: (() => void) | null): void {
  on401Callback = callback;
}

/**
 * Authenticated fetch: adds Authorization: Bearer <token>, handles 401 in one place.
 * Use this for all requests to the Pivotly API that require or will require auth.
 *
 * - Token is never logged.
 * - On 401: invokes on401Callback() then throws ApiAuthError so callers can avoid double UI.
 */
export async function authenticatedFetch(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      'API not configured. Set EXPO_PUBLIC_API_URL in apps/mobile/.env (e.g. http://localhost:3000).'
    );
  }

  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    ...(typeof fetchOptions.headers === 'object' && !(fetchOptions.headers instanceof Headers)
      ? (fetchOptions.headers as Record<string, string>)
      : {}),
  };
  if (headers['Content-Type'] == null) {
    headers['Content-Type'] = 'application/json';
  }

  if (!skipAuth && authTokenGetter) {
    const token = await authTokenGetter();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, { ...fetchOptions, headers });

  if (res.status === 401) {
    if (on401Callback) {
      on401Callback();
    }
    throw new ApiAuthError(401, 'Session expired. Please sign in again.');
  }

  return res;
}

/**
 * Sync profile for the current user. Call after login or session restore.
 * Uses centralized client: attaches Bearer token and uses shared 401 handling.
 */
export async function syncProfile(
  id: string,
  email: string,
  username?: string | null,
  firstName?: string | null,
  lastName?: string | null
): Promise<SyncProfileResult> {
  try {
    const res = await authenticatedFetch('/profiles/sync', {
      method: 'POST',
      body: JSON.stringify({
        id,
        email,
        username: username ?? undefined,
        first_name: firstName ?? undefined,
        last_name: lastName ?? undefined,
      }),
    });

    const data = await res.json().catch(() => ({}));
    const errorMsg = (data?.error as string) || (data?.message as string);

    if (!res.ok) {
      if (res.status === 409) {
        return { ok: false, error: errorMsg || 'Username is already taken.' };
      }
      if (res.status === 400) {
        return { ok: false, error: errorMsg || 'Invalid request.' };
      }
      return {
        ok: false,
        error: errorMsg || `Profile sync failed (${res.status}).`,
      };
    }

    const profile = data?.data;
    if (!profile?.id || !profile?.email || !profile?.username) {
      return { ok: false, error: 'Invalid profile response from API.' };
    }

    return {
      ok: true,
      profile: {
        id: profile.id,
        email: profile.email,
        username: profile.username,
        created_at: profile.created_at,
      },
    };
  } catch (e) {
    if (e instanceof ApiAuthError) {
      return { ok: false, error: e.message };
    }
    const raw = e instanceof Error ? e.message : 'Network error.';
    const hint =
      raw.toLowerCase().includes('network') || raw.toLowerCase().includes('failed')
        ? " Make sure the API is running (bun run dev:api from repo root). On a physical device, use your computer's IP in .env (e.g. http://192.168.1.x:3000) instead of localhost."
        : '';
    return { ok: false, error: raw + hint };
  }
}

export type CreateIdeaResult =
  | { ok: true; idea: IdeaDto }
  | { ok: false; error: string };

/**
 * Create an idea. Uses Bearer token; API derives author from JWT. Do not send author_id in body.
 */
export async function createIdea(
  title: string,
  description: string,
  options?: { validation_score?: number; monetization?: number; difficulty?: number }
): Promise<CreateIdeaResult> {
  try {
    const res = await authenticatedFetch('/ideas', {
      method: 'POST',
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        ...(options?.validation_score != null && { validation_score: options.validation_score }),
        ...(options?.monetization != null && { monetization: options.monetization }),
        ...(options?.difficulty != null && { difficulty: options.difficulty }),
      }),
    });

    const data = await res.json().catch(() => ({}));
    const errorMsg = (data?.error as string) || (data?.message as string);

    if (!res.ok) {
      if (res.status === 404) {
        return { ok: false, error: errorMsg || 'Profile not found.' };
      }
      if (res.status === 400) {
        return { ok: false, error: errorMsg || 'Invalid request.' };
      }
      return {
        ok: false,
        error: errorMsg || `Failed to post idea (${res.status}).`,
      };
    }

    const idea = data?.data;
    if (!idea?.id || !idea?.title || !idea?.username) {
      return { ok: false, error: 'Invalid response from API.' };
    }

    return {
      ok: true,
      idea: idea as IdeaDto,
    };
  } catch (e) {
    if (e instanceof ApiAuthError) {
      return { ok: false, error: e.message };
    }
    const raw = e instanceof Error ? e.message : 'Network error.';
    const hint =
      raw.toLowerCase().includes('network') || raw.toLowerCase().includes('failed')
        ? " Make sure the API is running (bun run dev:api from repo root). On a physical device, use your computer's IP in .env (e.g. http://192.168.1.x:3000) instead of localhost."
        : '';
    return { ok: false, error: raw + hint };
  }
}

export type GetIdeasResult =
  | { ok: true; ideas: IdeaDto[] }
  | { ok: false; error: string };

/**
 * Fetch ideas for the feed (newest first). Uses Bearer token.
 */
export async function getIdeas(): Promise<GetIdeasResult> {
  try {
    const res = await authenticatedFetch('/ideas');

    const data = await res.json().catch(() => ({}));
    const errorMsg = (data?.error as string) || (data?.message as string);

    if (!res.ok) {
      return {
        ok: false,
        error: errorMsg || `Failed to load ideas (${res.status}).`,
      };
    }

    const list = data?.data;
    if (!Array.isArray(list)) {
      return { ok: true, ideas: [] };
    }

    return {
      ok: true,
      ideas: list as IdeaDto[],
    };
  } catch (e) {
    if (e instanceof ApiAuthError) {
      return { ok: false, error: e.message };
    }
    const raw = e instanceof Error ? e.message : 'Network error.';
    const hint =
      raw.toLowerCase().includes('network') || raw.toLowerCase().includes('failed')
        ? " Make sure the API is running (bun run dev:api from repo root). On a physical device, use your computer's IP in .env."
        : '';
    return { ok: false, error: raw + hint };
  }
}

export type GetIdeaResult =
  | { ok: true; idea: IdeaDto }
  | { ok: false; error: string };

/**
 * Fetch a single idea by id (for detail screen).
 */
export async function getIdea(id: string): Promise<GetIdeaResult> {
  try {
    const res = await authenticatedFetch(`/ideas/${encodeURIComponent(id)}`);

    const data = await res.json().catch(() => ({}));
    const errorMsg = (data?.error as string) || (data?.message as string);

    if (!res.ok) {
      if (res.status === 404) {
        return { ok: false, error: 'Idea not found.' };
      }
      return {
        ok: false,
        error: errorMsg || `Failed to load idea (${res.status}).`,
      };
    }

    const idea = data?.data;
    if (!idea?.id || !idea?.title || !idea?.username) {
      return { ok: false, error: 'Invalid response from API.' };
    }

    return {
      ok: true,
      idea: idea as IdeaDto,
    };
  } catch (e) {
    if (e instanceof ApiAuthError) {
      return { ok: false, error: e.message };
    }
    const raw = e instanceof Error ? e.message : 'Network error.';
    const hint =
      raw.toLowerCase().includes('network') || raw.toLowerCase().includes('failed')
        ? " Make sure the API is running (bun run dev:api from repo root). On a physical device, use your computer's IP in .env."
        : '';
    return { ok: false, error: raw + hint };
  }
}

export type GetCommentsResult =
  | { ok: true; comments: CommentDto[] }
  | { ok: false; error: string };

/**
 * Fetch comments for an idea (newest first).
 */
export async function getComments(ideaId: string): Promise<GetCommentsResult> {
  try {
    const res = await authenticatedFetch(`/ideas/${encodeURIComponent(ideaId)}/comments`);
    const data = await res.json().catch(() => ({}));
    const errorMsg = (data?.error as string) || (data?.message as string);
    if (!res.ok) {
      return {
        ok: false,
        error: errorMsg || `Failed to load comments (${res.status}).`,
      };
    }
    const list = data?.data;
    if (!Array.isArray(list)) {
      return { ok: true, comments: [] };
    }
    return { ok: true, comments: list as CommentDto[] };
  } catch (e) {
    if (e instanceof ApiAuthError) {
      return { ok: false, error: e.message };
    }
    const raw = e instanceof Error ? e.message : 'Network error.';
    const hint =
      raw.toLowerCase().includes('network') || raw.toLowerCase().includes('failed')
        ? " Make sure the API is running (bun run dev:api from repo root). On a physical device, use your computer's IP in .env."
        : '';
    return { ok: false, error: raw + hint };
  }
}

export type CreateCommentResult =
  | { ok: true; comment: CommentDto }
  | { ok: false; error: string };

/**
 * Post a comment on an idea. Uses Bearer token; API derives author from JWT. Do not send author_id in body.
 */
export async function createComment(
  ideaId: string,
  body: string
): Promise<CreateCommentResult> {
  try {
    const res = await authenticatedFetch(`/ideas/${encodeURIComponent(ideaId)}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body: body.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    const errorMsg = (data?.error as string) || (data?.message as string);
    if (!res.ok) {
      if (res.status === 404) {
        return { ok: false, error: errorMsg || 'Idea or profile not found.' };
      }
      if (res.status === 400) {
        return { ok: false, error: errorMsg || 'Invalid request.' };
      }
      return {
        ok: false,
        error: errorMsg || `Failed to post comment (${res.status}).`,
      };
    }
    const comment = data?.data;
    if (!comment?.id || !comment?.username || comment?.body == null) {
      return { ok: false, error: 'Invalid response from API.' };
    }
    return { ok: true, comment: comment as CommentDto };
  } catch (e) {
    if (e instanceof ApiAuthError) {
      return { ok: false, error: e.message };
    }
    const raw = e instanceof Error ? e.message : 'Network error.';
    const hint =
      raw.toLowerCase().includes('network') || raw.toLowerCase().includes('failed')
        ? " Make sure the API is running (bun run dev:api from repo root). On a physical device, use your computer's IP in .env."
        : '';
    return { ok: false, error: raw + hint };
  }
}
