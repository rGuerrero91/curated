// Zod schemas for all forms.
//
// IMPORTANT: These must be defined at module level (not inside functions or components).
// Superforms memoizes the Zod adapter per schema instance — if a new schema object is
// created on every request/render, the memoization cache is bypassed and performance suffers.
//
// Used in both +page.server.ts (superValidate) and +page.svelte (superForm validators option).

import { z } from 'zod'

export const createCollectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or fewer'),
  description: z.string().max(500, 'Description must be 500 characters or fewer').optional(),
  // Stored as a comma-separated string in the form; split into string[] in the action
  tags: z.string().max(200).optional(),
  isPublic: z.boolean().default(true),
})

export const addLinkSchema = z.object({
  url: z.url('Must be a valid URL (include https://)'),
  note: z.string().max(300, 'Note must be 300 characters or fewer').optional(),
})

export const profileSchema = z.object({
  displayName: z.string().max(80, 'Display name must be 80 characters or fewer').optional(),
  bio: z.string().max(300, 'Bio must be 300 characters or fewer').optional(),
  websiteUrl: z.url('Must be a valid URL').or(z.literal('')).optional(),
  username: z.string().min(2).max(30).regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores').optional(),
  isPrivate: z.boolean().default(false),
})

export const commentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment must be 1000 characters or fewer'),
  // parentId is included as a hidden input for threaded replies
  parentId: z.string().optional(),
})

// Type exports — Superforms infers these from the schema
export type CreateCollectionSchema = typeof createCollectionSchema
export type AddLinkSchema = typeof addLinkSchema
export type CommentSchema = typeof commentSchema
