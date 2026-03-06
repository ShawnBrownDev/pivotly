/**
 * Idea-related types (API DTOs and request shapes).
 */

/** Body for POST /ideas. author_id is set by API from JWT; client may omit it. */
export interface CreateIdeaRequest {
  author_id?: string;
  title: string;
  description: string;
  /** Optional 0–100; defaults to 0 if omitted */
  validation_score?: number;
  monetization?: number;
  difficulty?: number;
}

/** Idea returned by API (e.g. GET /ideas, GET /ideas/:id, POST /ideas). Includes author username for display. */
export interface IdeaDto {
  id: string;
  author_id: string;
  username: string;
  /** Author display name: "First Last" when first_name/last_name present */
  author_display_name?: string | null;
  title: string;
  description: string;
  validation_score: number;
  monetization: number;
  difficulty: number;
  upvotes: number;
  downvotes: number;
  comments: number;
  created_at: string;
  updated_at: string;
}

/** Comment on an idea. Returned by GET /ideas/:id/comments. */
export interface CommentDto {
  id: string;
  idea_id: string;
  author_id: string;
  username: string;
  body: string;
  created_at: string;
}

/** Body for POST /ideas/:id/comments. author_id is set by API from JWT; client may omit it. */
export interface CreateCommentRequest {
  author_id?: string;
  body: string;
}
