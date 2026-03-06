/**
 * Shared auth types (User, Session).
 * Single source of truth for app and API; neon-auth-client uses these types.
 */

/** Authenticated user from Neon Auth / Better Auth. */
export type User = {
  id: string;
  email: string;
  name?: string;
  image?: string;
};

/** Session with optional tokens and user. */
export type Session = {
  token?: string;
  accessToken?: string;
  user: User;
  expiresAt?: number;
};
