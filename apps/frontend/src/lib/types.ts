// TypeScript interfaces derived from the Prisma schema and backend API service return shapes.
// These are safe to import on both client and server — no browser APIs used here.

export interface User {
  id: string
  username: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  websiteUrl: string | null
  isPrivate: boolean
  createdAt: string
}

export interface UserProfile extends User {
  _count: {
    collections: number
    followers: number
    following: number
  }
}

export interface Tag {
  id: string
  name: string
  _count?: { collections: number }
}

export interface CollectionTag {
  tag: Pick<Tag, 'id' | 'name'>
}

// Lightweight collection shape returned by list endpoints (trending, browse, feed)
export interface Collection {
  id: string
  slug: string
  title: string
  description: string | null
  coverUrl: string | null
  isPublic: boolean
  createdAt: string
  updatedAt: string
  owner: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>
  tags: CollectionTag[]
  _count: {
    likes: number
    followers: number
    items: number
  }
}

export interface Link {
  id: string
  url: string
  domain: string
  title: string | null
  description: string | null
  thumbnailUrl: string | null
  faviconUrl: string | null
  scrapedAt: string | null
}

export interface CollectionItem {
  id: string
  note: string | null
  position: number
  addedAt: string
  link: Link
}

// Full collection shape including items, returned by GET /collections/:id
export interface CollectionDetail extends Collection {
  items: CollectionItem[]
  _count: Collection['_count'] & { comments: number }
}

// Generic cursor-paginated response wrapper
export interface PaginatedResponse<T> {
  items: T[]
  nextCursor: string | null
}

// Shapes for form submission inputs
export interface CreateCollectionInput {
  title: string
  description?: string
  isPublic?: boolean
  tags?: string[]
}
