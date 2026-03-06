/**
 * Shared TypeScript types for Pivotly (mobile + API).
 */

export * from './auth';
export * from './idea';
export * from './profile';

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
