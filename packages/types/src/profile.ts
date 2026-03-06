/**
 * Profile-related types (API DTOs and request shapes).
 */

/** Profile returned by API (matches db profiles table) */
export interface ProfileDto {
  id: string;
  email: string;
  username: string;
  first_name?: string | null;
  last_name?: string | null;
  created_at: string;
}

/** Body for POST /profiles/sync */
export interface ProfilesSyncRequest {
  id: string;
  email: string;
  username?: string;
  first_name?: string | null;
  last_name?: string | null;
}
