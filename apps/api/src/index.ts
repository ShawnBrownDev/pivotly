import { Hono } from 'hono';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type {
  ApiResponse,
  CommentDto,
  CreateCommentRequest,
  CreateIdeaRequest,
  IdeaDto,
  ProfileDto,
  ProfilesSyncRequest,
} from '@pivotly/types';
import { db, desc, eq, ideas, ideaComments, profiles, sql } from '@pivotly/db';

// Load .env from monorepo root when present (try multiple paths for different run contexts)
function loadRootEnv() {
  const candidates = [
    resolve(import.meta.dir, '../../.env'),
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../../.env'),
  ];
  for (const envPath of candidates) {
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^['"]|['"]$/g, '');
          if (!process.env[key]) process.env[key] = value;
        }
      }
      return;
    }
  }
}
loadRootEnv();

const app = new Hono();

app.get('/', (c) => {
  return c.json<ApiResponse<{ message: string }>>({
    data: { message: 'Pivotly API' },
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Get authenticated user id from Bearer JWT (Neon Auth). Returns null if missing or invalid. */
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
async function getAuthUserId(c: { req: { header: (name: string) => string | undefined } }): Promise<string | null> {
  const auth = c.req.header('Authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : null;
  if (!token) return null;
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  if (!baseUrl || !baseUrl.startsWith('http')) return null;
  try {
    if (!jwks) {
      jwks = createRemoteJWKSet(new URL(`${baseUrl.replace(/\/$/, '')}/.well-known/jwks.json`));
    }
    const origin = new URL(baseUrl).origin;
    const { payload } = await jwtVerify(token, jwks, { issuer: origin, audience: origin });
    const sub = payload.sub ?? payload.id;
    return typeof sub === 'string' && UUID_REGEX.test(sub) ? sub : null;
  } catch {
    return null;
  }
}

/**
 * POST /profiles/sync
 * Sync profile for authenticated user. Call after login/session restore.
 * - id: auth user id (UUID), must match authenticated user
 * - email: auth user email
 * - username: optional; required when creating a new profile
 * Creates profile if missing; returns existing or new profile.
 */
app.post('/profiles/sync', async (c) => {
  let body: ProfilesSyncRequest;
  try {
    body = await c.req.json<ProfilesSyncRequest>();
  } catch {
    return c.json<ApiResponse<ProfileDto>>(
      { data: null as unknown as ProfileDto, error: 'Invalid JSON body' },
      400
    );
  }

  const { id, email, username, first_name, last_name } = body;

  if (!id || typeof id !== 'string' || !UUID_REGEX.test(id)) {
    return c.json<ApiResponse<ProfileDto>>(
      { data: null as unknown as ProfileDto, error: 'Valid user id (UUID) is required' },
      400
    );
  }
  if (!email || typeof email !== 'string' || !email.trim()) {
    return c.json<ApiResponse<ProfileDto>>(
      { data: null as unknown as ProfileDto, error: 'Email is required' },
      400
    );
  }

  const emailTrimmed = email.trim();

  try {
    const existing = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);

    if (existing.length > 0) {
      const p = existing[0];
      return c.json<ApiResponse<ProfileDto>>({
        data: {
          id: p.id,
          email: p.email,
          username: p.username,
          first_name: p.firstName ?? null,
          last_name: p.lastName ?? null,
          created_at: p.createdAt.toISOString(),
        },
      });
    }

    // Create new profile: username required for create
    const usernameValue = typeof username === 'string' && username.trim() ? username.trim() : null;
    if (!usernameValue || usernameValue.length < 3) {
      return c.json<ApiResponse<ProfileDto>>(
        { data: null as unknown as ProfileDto, error: 'Username is required when creating profile (min 3 characters)' },
        400
      );
    }

    const firstNameVal =
      typeof first_name === 'string' && first_name.trim() ? first_name.trim() : null;
    const lastNameVal =
      typeof last_name === 'string' && last_name.trim() ? last_name.trim() : null;

    await db.insert(profiles).values({
      id,
      email: emailTrimmed,
      username: usernameValue,
      firstName: firstNameVal,
      lastName: lastNameVal,
    });

    const created = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
    const p = created[0];
    return c.json<ApiResponse<ProfileDto>>(
      {
        data: {
          id: p.id,
          email: p.email,
          username: p.username,
          first_name: p.firstName ?? null,
          last_name: p.lastName ?? null,
          created_at: p.createdAt.toISOString(),
        },
      },
      201
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[POST /profiles/sync]', e);
    if (msg.includes('profiles_username_unique') || msg.includes('unique') || msg.includes('duplicate')) {
      return c.json<ApiResponse<ProfileDto>>(
        { data: null as unknown as ProfileDto, error: 'Username is already taken' },
        409
      );
    }
    return c.json<ApiResponse<ProfileDto>>(
      { data: null as unknown as ProfileDto, error: 'Something went wrong. Please try again.' },
      500
    );
  }
});

/** Clamp optional 0-100 metric or return 0 */
function clampMetric(v: unknown): number {
  if (typeof v !== 'number' || Number.isNaN(v)) return 0;
  return Math.min(100, Math.max(0, Math.round(v)));
}

function authorDisplayName(
  first: string | null | undefined,
  last: string | null | undefined
): string | null {
  const parts = [first, last].filter((x): x is string => typeof x === 'string' && x.trim() !== '');
  return parts.length ? parts.join(' ') : null;
}

/**
 * POST /ideas
 * Create an idea. Requires Authorization: Bearer <Neon Auth JWT>. author_id is taken from the token.
 * Body: title, description, optional validation_score/monetization/difficulty.
 */
app.post('/ideas', async (c) => {
  const author_id = await getAuthUserId(c);
  if (!author_id) {
    return c.json<ApiResponse<IdeaDto>>(
      { data: null as unknown as IdeaDto, error: 'Unauthorized' },
      401
    );
  }
  let body: CreateIdeaRequest;
  try {
    body = await c.req.json<CreateIdeaRequest>();
  } catch {
    return c.json<ApiResponse<IdeaDto>>(
      { data: null as unknown as IdeaDto, error: 'Invalid JSON body' },
      400
    );
  }

  const { title, description, validation_score, monetization, difficulty } = body;

  const titleTrimmed = typeof title === 'string' ? title.trim() : '';
  const descriptionTrimmed = typeof description === 'string' ? description.trim() : '';
  if (!titleTrimmed || titleTrimmed.length < 1) {
    return c.json<ApiResponse<IdeaDto>>(
      { data: null as unknown as IdeaDto, error: 'Title is required' },
      400
    );
  }
  if (!descriptionTrimmed || descriptionTrimmed.length < 1) {
    return c.json<ApiResponse<IdeaDto>>(
      { data: null as unknown as IdeaDto, error: 'Description is required' },
      400
    );
  }

  try {
    const [profileRow] = await db.select().from(profiles).where(eq(profiles.id, author_id)).limit(1);
    if (!profileRow) {
      return c.json<ApiResponse<IdeaDto>>(
        { data: null as unknown as IdeaDto, error: 'Author profile not found' },
        404
      );
    }

    const [created] = await db
      .insert(ideas)
      .values({
        authorId: author_id,
        title: titleTrimmed,
        description: descriptionTrimmed,
        validationScore: clampMetric(validation_score),
        monetization: clampMetric(monetization),
        difficulty: clampMetric(difficulty),
      })
      .returning();

    if (!created) {
      return c.json<ApiResponse<IdeaDto>>(
        { data: null as unknown as IdeaDto, error: 'Failed to read created idea' },
        500
      );
    }

    return c.json<ApiResponse<IdeaDto>>(
      {
        data: {
          id: created.id,
          author_id: created.authorId,
          username: profileRow.username,
          author_display_name: authorDisplayName(profileRow.firstName, profileRow.lastName),
          title: created.title,
          description: created.description,
          validation_score: created.validationScore,
          monetization: created.monetization,
          difficulty: created.difficulty,
          upvotes: created.upvotes,
          downvotes: created.downvotes,
          comments: created.comments,
          created_at: created.createdAt.toISOString(),
          updated_at: created.updatedAt.toISOString(),
        },
      },
      201
    );
  } catch (e: unknown) {
    console.error('[POST /ideas]', e);
    return c.json<ApiResponse<IdeaDto>>(
      { data: null as unknown as IdeaDto, error: 'Something went wrong. Please try again.' },
      500
    );
  }
});

/**
 * GET /ideas
 * List ideas newest first. Returns IdeaDto[] with author username.
 */
app.get('/ideas', async (c) => {
  try {
    const rows = await db
      .select({
        id: ideas.id,
        authorId: ideas.authorId,
        username: profiles.username,
        authorFirstName: profiles.firstName,
        authorLastName: profiles.lastName,
        title: ideas.title,
        description: ideas.description,
        validationScore: ideas.validationScore,
        monetization: ideas.monetization,
        difficulty: ideas.difficulty,
        upvotes: ideas.upvotes,
        downvotes: ideas.downvotes,
        comments: ideas.comments,
        createdAt: ideas.createdAt,
        updatedAt: ideas.updatedAt,
      })
      .from(ideas)
      .innerJoin(profiles, eq(ideas.authorId, profiles.id))
      .orderBy(desc(ideas.createdAt));

    const data: IdeaDto[] = rows.map((row) => ({
      id: row.id,
      author_id: row.authorId,
      username: row.username,
      author_display_name: authorDisplayName(row.authorFirstName, row.authorLastName),
      title: row.title,
      description: row.description,
      validation_score: row.validationScore,
      monetization: row.monetization,
      difficulty: row.difficulty,
      upvotes: row.upvotes,
      downvotes: row.downvotes,
      comments: row.comments,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
    }));

    return c.json<ApiResponse<IdeaDto[]>>({ data });
  } catch (e: unknown) {
    console.error('[GET /ideas]', e);
    return c.json<ApiResponse<IdeaDto[]>>(
      { data: [] as IdeaDto[], error: 'Something went wrong. Please try again.' },
      500
    );
  }
});

/**
 * GET /ideas/:id
 * Single idea by id. Returns 404 if not found.
 */
app.get('/ideas/:id', async (c) => {
  const id = c.req.param('id');
  if (!id) {
    return c.json<ApiResponse<IdeaDto>>(
      { data: null as unknown as IdeaDto, error: 'Idea id is required' },
      400
    );
  }
  try {
    const rows = await db
      .select({
        id: ideas.id,
        authorId: ideas.authorId,
        username: profiles.username,
        authorFirstName: profiles.firstName,
        authorLastName: profiles.lastName,
        title: ideas.title,
        description: ideas.description,
        validationScore: ideas.validationScore,
        monetization: ideas.monetization,
        difficulty: ideas.difficulty,
        upvotes: ideas.upvotes,
        downvotes: ideas.downvotes,
        comments: ideas.comments,
        createdAt: ideas.createdAt,
        updatedAt: ideas.updatedAt,
      })
      .from(ideas)
      .innerJoin(profiles, eq(ideas.authorId, profiles.id))
      .where(eq(ideas.id, id))
      .limit(1);

    const row = rows[0];
    if (!row) {
      return c.json<ApiResponse<IdeaDto>>(
        { data: null as unknown as IdeaDto, error: 'Idea not found' },
        404
      );
    }

    const data: IdeaDto = {
      id: row.id,
      author_id: row.authorId,
      username: row.username,
      author_display_name: authorDisplayName(row.authorFirstName, row.authorLastName),
      title: row.title,
      description: row.description,
      validation_score: row.validationScore,
      monetization: row.monetization,
      difficulty: row.difficulty,
      upvotes: row.upvotes,
      downvotes: row.downvotes,
      comments: row.comments,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
    };
    return c.json<ApiResponse<IdeaDto>>({ data });
  } catch (e: unknown) {
    console.error('[GET /ideas/:id]', e);
    return c.json<ApiResponse<IdeaDto>>(
      { data: null as unknown as IdeaDto, error: 'Something went wrong. Please try again.' },
      500
    );
  }
});

/**
 * GET /ideas/:id/comments
 * List comments for an idea, newest first.
 */
app.get('/ideas/:id/comments', async (c) => {
  const ideaId = c.req.param('id');
  if (!ideaId) {
    return c.json<ApiResponse<CommentDto[]>>(
      { data: [], error: 'Idea id is required' },
      400
    );
  }
  try {
    const rows = await db
      .select({
        id: ideaComments.id,
        ideaId: ideaComments.ideaId,
        authorId: ideaComments.authorId,
        username: profiles.username,
        body: ideaComments.body,
        createdAt: ideaComments.createdAt,
      })
      .from(ideaComments)
      .innerJoin(profiles, eq(ideaComments.authorId, profiles.id))
      .where(eq(ideaComments.ideaId, ideaId))
      .orderBy(desc(ideaComments.createdAt));

    const data: CommentDto[] = rows.map((row) => ({
      id: row.id,
      idea_id: row.ideaId,
      author_id: row.authorId,
      username: row.username,
      body: row.body,
      created_at: row.createdAt.toISOString(),
    }));
    return c.json<ApiResponse<CommentDto[]>>({ data });
  } catch (e: unknown) {
    console.error('[GET /ideas/:id/comments]', e);
    return c.json<ApiResponse<CommentDto[]>>(
      { data: [], error: 'Something went wrong. Please try again.' },
      500
    );
  }
});

/**
 * POST /ideas/:id/comments
 * Add a comment to an idea. Requires Authorization: Bearer <Neon Auth JWT>. author_id is taken from the token.
 * Body: body (comment text).
 */
app.post('/ideas/:id/comments', async (c) => {
  const author_id = await getAuthUserId(c);
  if (!author_id) {
    return c.json<ApiResponse<CommentDto>>(
      { data: null as unknown as CommentDto, error: 'Unauthorized' },
      401
    );
  }
  const ideaId = c.req.param('id');
  if (!ideaId) {
    return c.json<ApiResponse<CommentDto>>(
      { data: null as unknown as CommentDto, error: 'Idea id is required' },
      400
    );
  }
  let body: CreateCommentRequest;
  try {
    body = await c.req.json<CreateCommentRequest>();
  } catch {
    return c.json<ApiResponse<CommentDto>>(
      { data: null as unknown as CommentDto, error: 'Invalid JSON body' },
      400
    );
  }
  const bodyText = body.body;
  const bodyTrimmed = typeof bodyText === 'string' ? bodyText.trim() : '';
  if (!bodyTrimmed || bodyTrimmed.length < 1) {
    return c.json<ApiResponse<CommentDto>>(
      { data: null as unknown as CommentDto, error: 'Comment body is required' },
      400
    );
  }
  try {
    const [ideaRow] = await db.select().from(ideas).where(eq(ideas.id, ideaId)).limit(1);
    if (!ideaRow) {
      return c.json<ApiResponse<CommentDto>>(
        { data: null as unknown as CommentDto, error: 'Idea not found' },
        404
      );
    }
    const [profileRow] = await db.select().from(profiles).where(eq(profiles.id, author_id)).limit(1);
    if (!profileRow) {
      return c.json<ApiResponse<CommentDto>>(
        { data: null as unknown as CommentDto, error: 'Author profile not found' },
        404
      );
    }

    const [created] = await db
      .insert(ideaComments)
      .values({
        ideaId,
        authorId: author_id,
        body: bodyTrimmed,
      })
      .returning();

    if (!created) {
      return c.json<ApiResponse<CommentDto>>(
        { data: null as unknown as CommentDto, error: 'Failed to create comment' },
        500
      );
    }

    await db
      .update(ideas)
      .set({ comments: sql`${ideas.comments} + 1` })
      .where(eq(ideas.id, ideaId));

    return c.json<ApiResponse<CommentDto>>(
      {
        data: {
          id: created.id,
          idea_id: created.ideaId,
          author_id: created.authorId,
          username: profileRow.username,
          body: created.body,
          created_at: created.createdAt.toISOString(),
        },
      },
      201
    );
  } catch (e: unknown) {
    console.error('[POST /ideas/:id/comments]', e);
    return c.json<ApiResponse<CommentDto>>(
      { data: null as unknown as CommentDto, error: 'Something went wrong. Please try again.' },
      500
    );
  }
});

// Example: use db (uncomment when you have DATABASE_URL set)
// import { db } from '@pivotly/db';
// app.get('/users', async (c) => {
//   const users = await db.select().from(usersTable);
//   return c.json({ data: users });
// });

export default {
  port: process.env.PORT ?? 3000,
  fetch: app.fetch,
};
