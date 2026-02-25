/**
 * Shared TypeScript types for Pivotly (mobile + API).
 * Re-export API response/request types and domain types here.
 */

// Example: API response shape
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Example: pagination
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
