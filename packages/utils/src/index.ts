export { z } from 'zod';

/**
 * Shared validation schemas and helpers.
 * Add app-specific schemas here or in separate files.
 */

export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}
