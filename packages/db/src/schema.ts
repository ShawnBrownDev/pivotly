import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Example schema. Replace with your app's tables.
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

/**
 * Profiles table: one row per authenticated user (id = auth user id).
 * Created on first sync after signup; no anonymous profiles.
 */
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  username: text('username').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

/**
 * Ideas table: user-posted startup ideas.
 * author_id references profiles.id; metrics default to 0 until computed.
 */
export const ideas = pgTable('ideas', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').notNull().references(() => profiles.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  validationScore: integer('validation_score').default(0).notNull(),
  monetization: integer('monetization').default(0).notNull(),
  difficulty: integer('difficulty').default(0).notNull(),
  upvotes: integer('upvotes').default(0).notNull(),
  downvotes: integer('downvotes').default(0).notNull(),
  comments: integer('comments').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Idea = typeof ideas.$inferSelect;
export type NewIdea = typeof ideas.$inferInsert;

/**
 * Comments on ideas. author_id references profiles.id.
 */
export const ideaComments = pgTable('idea_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  ideaId: uuid('idea_id').notNull().references(() => ideas.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => profiles.id),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type IdeaComment = typeof ideaComments.$inferSelect;
export type NewIdeaComment = typeof ideaComments.$inferInsert;
