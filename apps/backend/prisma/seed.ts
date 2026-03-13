/**
 * Seed script for local / frontend development.
 *
 * Creates a representative dataset covering every major entity so the frontend
 * has realistic data to render without needing Firebase or external services.
 *
 * firebaseUid values are fake — they work for seed purposes but cannot be used
 * to obtain a real session cookie. To log in as one of these users during
 * frontend dev you'll need to create matching Firebase users in the Firebase
 * Auth emulator and update the firebaseUid values, or bypass auth in dev mode.
 *
 * Run:
 *   npm run db:seed -w @curated/backend
 *   # or from apps/backend/
 *   npm run db:seed
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// ─── Raw data ─────────────────────────────────────────────────────────────────

const USERS = [
  {
    firebaseUid: 'seed_uid_alice_001',
    username: 'alice',
    displayName: 'Alice Chen',
    bio: 'Designer & creative technologist. I collect things worth revisiting.',
    avatarUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=alice',
    websiteUrl: 'https://alicechen.design',
    isPrivate: false,
  },
  {
    firebaseUid: 'seed_uid_bob_002',
    username: 'bob',
    displayName: 'Bob Martinez',
    bio: 'Software engineer. Mostly TypeScript, occasionally functional.',
    avatarUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=bob',
    websiteUrl: null,
    isPrivate: false,
  },
  {
    firebaseUid: 'seed_uid_cleo_003',
    username: 'cleo',
    displayName: 'Cleo Williams',
    bio: 'Researcher. Reading papers so you don\'t have to.',
    avatarUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=cleo',
    websiteUrl: 'https://cleo.substack.com',
    isPrivate: false,
  },
  {
    firebaseUid: 'seed_uid_dev_004',
    username: 'devnull',
    displayName: 'Dev Null',
    bio: 'Private collector. Links go in, links don\'t come out.',
    avatarUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=devnull',
    websiteUrl: null,
    isPrivate: true,
  },
  {
    firebaseUid: 'seed_uid_mia_005',
    username: 'mia',
    displayName: 'Mia Okonkwo',
    bio: 'Indie hacker. Building in public.',
    avatarUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=mia',
    websiteUrl: 'https://mia.build',
    isPrivate: false,
  },
]

// Links are de-duplicated across collections (one Link row, many CollectionItems)
const LINKS = [
  // Design
  {
    key: 'refactoring-ui',
    url: 'https://www.refactoringui.com',
    domain: 'refactoringui.com',
    title: 'Refactoring UI',
    description: 'Learn UI design by looking at what makes interfaces good or bad.',
    thumbnailUrl: 'https://www.refactoringui.com/og-image.png',
    faviconUrl: 'https://www.refactoringui.com/favicon.ico',
  },
  {
    key: 'realworld-design',
    url: 'https://www.designsystems.com',
    domain: 'designsystems.com',
    title: 'Design Systems',
    description: 'A Figma publication for design systems practitioners.',
    thumbnailUrl: null,
    faviconUrl: 'https://www.designsystems.com/favicon.ico',
  },
  {
    key: 'colors-lol',
    url: 'https://www.happyhues.co',
    domain: 'happyhues.co',
    title: 'Happy Hues',
    description: 'Curated colors and palettes you can use as a color palette inspiration.',
    thumbnailUrl: 'https://www.happyhues.co/og-image.png',
    faviconUrl: 'https://www.happyhues.co/favicon.ico',
  },
  {
    key: 'type-scale',
    url: 'https://typescale.com',
    domain: 'typescale.com',
    title: 'Type Scale',
    description: 'Create stunning typography, generate CSS, and find the perfect type scale for your next project.',
    thumbnailUrl: null,
    faviconUrl: 'https://typescale.com/favicon.ico',
  },
  {
    key: 'shadcn',
    url: 'https://ui.shadcn.com',
    domain: 'ui.shadcn.com',
    title: 'shadcn/ui',
    description: 'Beautifully designed components that you can copy and paste into your apps.',
    thumbnailUrl: 'https://ui.shadcn.com/og.png',
    faviconUrl: 'https://ui.shadcn.com/favicon.ico',
  },
  // TypeScript / Dev
  {
    key: 'ts-docs',
    url: 'https://www.typescriptlang.org/docs/',
    domain: 'typescriptlang.org',
    title: 'TypeScript Documentation',
    description: 'Official TypeScript handbook and reference.',
    thumbnailUrl: null,
    faviconUrl: 'https://www.typescriptlang.org/favicon-32x32.png',
  },
  {
    key: 'total-typescript',
    url: 'https://www.totaltypescript.com',
    domain: 'totaltypescript.com',
    title: 'Total TypeScript',
    description: 'Become a TypeScript wizard through interactive exercises and workshops.',
    thumbnailUrl: 'https://www.totaltypescript.com/og-image.png',
    faviconUrl: 'https://www.totaltypescript.com/favicon.ico',
  },
  {
    key: 'ts-reset',
    url: 'https://www.totaltypescript.com/ts-reset',
    domain: 'totaltypescript.com',
    title: 'ts-reset',
    description: 'A "CSS reset" for TypeScript, improving types for common JavaScript APIs.',
    thumbnailUrl: null,
    faviconUrl: 'https://www.totaltypescript.com/favicon.ico',
  },
  {
    key: 'effect-ts',
    url: 'https://effect.website',
    domain: 'effect.website',
    title: 'Effect',
    description: 'The best way to build robust, composable, type-safe programs in TypeScript.',
    thumbnailUrl: 'https://effect.website/og-image.png',
    faviconUrl: 'https://effect.website/favicon.ico',
  },
  {
    key: 'zod',
    url: 'https://zod.dev',
    domain: 'zod.dev',
    title: 'Zod',
    description: 'TypeScript-first schema validation with static type inference.',
    thumbnailUrl: null,
    faviconUrl: 'https://zod.dev/favicon.ico',
  },
  // Indie hacking / startups
  {
    key: 'indie-hackers',
    url: 'https://www.indiehackers.com',
    domain: 'indiehackers.com',
    title: 'Indie Hackers',
    description: 'Learn from founders who have built profitable online businesses.',
    thumbnailUrl: 'https://www.indiehackers.com/images/og-image.png',
    faviconUrl: 'https://www.indiehackers.com/favicon.ico',
  },
  {
    key: 'pg-essays',
    url: 'http://www.paulgraham.com/articles.html',
    domain: 'paulgraham.com',
    title: 'Paul Graham Essays',
    description: 'Essays on startups, programming, and life.',
    thumbnailUrl: null,
    faviconUrl: 'http://www.paulgraham.com/favicon.ico',
  },
  {
    key: 'stripe-atlas',
    url: 'https://stripe.com/atlas/guides',
    domain: 'stripe.com',
    title: 'Stripe Atlas Guides',
    description: 'Guides for starting an internet business.',
    thumbnailUrl: 'https://stripe.com/img/v3/home/social.png',
    faviconUrl: 'https://stripe.com/favicon.ico',
  },
  {
    key: 'hn',
    url: 'https://news.ycombinator.com',
    domain: 'news.ycombinator.com',
    title: 'Hacker News',
    description: 'Social news for hackers and startup founders.',
    thumbnailUrl: null,
    faviconUrl: 'https://news.ycombinator.com/favicon.ico',
  },
  // Research / reading
  {
    key: 'arxiv',
    url: 'https://arxiv.org',
    domain: 'arxiv.org',
    title: 'arXiv',
    description: 'Open-access archive for preprints in physics, math, CS, and more.',
    thumbnailUrl: null,
    faviconUrl: 'https://arxiv.org/favicon.ico',
  },
  {
    key: 'connected-papers',
    url: 'https://www.connectedpapers.com',
    domain: 'connectedpapers.com',
    title: 'Connected Papers',
    description: 'Explore academic papers in a visual graph.',
    thumbnailUrl: 'https://www.connectedpapers.com/og-image.png',
    faviconUrl: 'https://www.connectedpapers.com/favicon.ico',
  },
  {
    key: 'semantic-scholar',
    url: 'https://www.semanticscholar.org',
    domain: 'semanticscholar.org',
    title: 'Semantic Scholar',
    description: 'AI-powered research tool for scientific literature.',
    thumbnailUrl: 'https://www.semanticscholar.org/img/og-image.png',
    faviconUrl: 'https://www.semanticscholar.org/favicon.ico',
  },
  // Tools / productivity
  {
    key: 'excalidraw',
    url: 'https://excalidraw.com',
    domain: 'excalidraw.com',
    title: 'Excalidraw',
    description: 'Virtual collaborative whiteboard for sketching hand-drawn like diagrams.',
    thumbnailUrl: 'https://excalidraw.com/og-image.png',
    faviconUrl: 'https://excalidraw.com/favicon.ico',
  },
  {
    key: 'ray-so',
    url: 'https://ray.so',
    domain: 'ray.so',
    title: 'Ray.so — Create beautiful code images',
    description: 'Turn your code into beautiful images.',
    thumbnailUrl: 'https://ray.so/og.png',
    faviconUrl: 'https://ray.so/favicon.ico',
  },
  {
    key: 'bundlephobia',
    url: 'https://bundlephobia.com',
    domain: 'bundlephobia.com',
    title: 'Bundlephobia',
    description: 'Find the cost of adding a npm package to your bundle.',
    thumbnailUrl: null,
    faviconUrl: 'https://bundlephobia.com/favicon.ico',
  },
]

// Collections: [ownerKey, title, description, isPublic, aiEnabled, tags[], linkKeys[], coverUrl?]
type CollectionDef = {
  ownerKey: string
  title: string
  description: string | null
  isPublic: boolean
  aiEnabled: boolean
  tags: string[]
  linkKeys: string[]
  coverUrl: string | null
}

const COLLECTIONS: CollectionDef[] = [
  {
    ownerKey: 'alice',
    title: 'Design Fundamentals',
    description: 'Resources I return to whenever I start a new project. Covers color, type, spacing, and components.',
    isPublic: true,
    aiEnabled: true,
    tags: ['design', 'ui', 'ux'],
    linkKeys: ['refactoring-ui', 'realworld-design', 'colors-lol', 'type-scale', 'shadcn'],
    coverUrl: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&auto=format&fit=crop',
  },
  {
    ownerKey: 'alice',
    title: 'Tools I Actually Use',
    description: 'Utilities and apps in my daily rotation.',
    isPublic: true,
    aiEnabled: false,
    tags: ['tools', 'productivity'],
    linkKeys: ['excalidraw', 'ray-so', 'bundlephobia'],
    coverUrl: null,
  },
  {
    ownerKey: 'bob',
    title: 'TypeScript Deep Cuts',
    description: 'Going beyond the basics — advanced patterns, utility types, and ecosystem picks.',
    isPublic: true,
    aiEnabled: true,
    tags: ['typescript', 'programming', 'javascript'],
    linkKeys: ['ts-docs', 'total-typescript', 'ts-reset', 'effect-ts', 'zod'],
    coverUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&auto=format&fit=crop',
  },
  {
    ownerKey: 'bob',
    title: 'Weekend Reading',
    description: 'Long reads and reference docs I\'ve been meaning to finish.',
    isPublic: true,
    aiEnabled: false,
    tags: ['reading', 'programming'],
    linkKeys: ['pg-essays', 'hn', 'arxiv'],
    coverUrl: null,
  },
  {
    ownerKey: 'cleo',
    title: 'Research Toolkit',
    description: 'Every tool I use to navigate academic literature efficiently.',
    isPublic: true,
    aiEnabled: true,
    tags: ['research', 'academia', 'tools'],
    linkKeys: ['arxiv', 'connected-papers', 'semantic-scholar', 'excalidraw'],
    coverUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&auto=format&fit=crop',
  },
  {
    ownerKey: 'mia',
    title: 'Indie Hacker Starter Pack',
    description: 'The reading list I wish someone had given me when I started building in public.',
    isPublic: true,
    aiEnabled: true,
    tags: ['indie-hacking', 'startups', 'business'],
    linkKeys: ['indie-hackers', 'pg-essays', 'stripe-atlas', 'hn'],
    coverUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop',
  },
  {
    ownerKey: 'mia',
    title: 'UI Inspiration',
    description: 'Sites and tools I bookmark when I need a design kick.',
    isPublic: true,
    aiEnabled: false,
    tags: ['design', 'ui', 'inspiration'],
    linkKeys: ['refactoring-ui', 'colors-lol', 'shadcn', 'ray-so'],
    coverUrl: null,
  },
  {
    ownerKey: 'devnull',
    title: 'Private Stash',
    description: null,
    isPublic: false,
    aiEnabled: false,
    tags: [],
    linkKeys: ['effect-ts', 'bundlephobia', 'ts-reset'],
    coverUrl: null,
  },
]

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Seeding database…')

  // 1. Upsert users
  const userMap = new Map<string, { id: string }>()

  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { firebaseUid: u.firebaseUid },
      update: {},
      create: u,
      select: { id: true, username: true },
    })
    userMap.set(u.username, { id: user.id })
    console.log(`  ✓ user @${u.username}`)
  }

  // 2. Upsert links (de-duplicated by URL)
  const linkMap = new Map<string, string>() // key → id

  const submitter = userMap.get('alice')!

  for (const l of LINKS) {
    const existing = await prisma.link.findFirst({ where: { url: l.url }, select: { id: true } })

    let linkId: string
    if (existing) {
      await prisma.link.update({
        where: { id: existing.id },
        data: {
          title: l.title,
          description: l.description,
          thumbnailUrl: l.thumbnailUrl,
          faviconUrl: l.faviconUrl,
          scrapedAt: new Date(),
        },
      })
      linkId = existing.id
    } else {
      const created = await prisma.link.create({
        data: {
          submittedBy: submitter.id,
          url: l.url,
          domain: l.domain,
          title: l.title,
          description: l.description,
          thumbnailUrl: l.thumbnailUrl,
          faviconUrl: l.faviconUrl,
          scrapedAt: new Date(),
        },
        select: { id: true },
      })
      linkId = created.id
    }

    linkMap.set(l.key, linkId)
  }
  console.log(`  ✓ ${LINKS.length} links`)

  // 3. Upsert tags
  const tagMap = new Map<string, string>() // name → id
  const allTagNames = [...new Set(COLLECTIONS.flatMap((c) => c.tags))]

  for (const name of allTagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
      select: { id: true },
    })
    tagMap.set(name, tag.id)
  }
  console.log(`  ✓ ${allTagNames.length} tags`)

  // 4. Create collections + items + tags
  const collectionMap = new Map<string, string>() // title → id

  for (const c of COLLECTIONS) {
    const owner = userMap.get(c.ownerKey)!
    const collectionSlug = slug(c.title)

    const existing = await prisma.collection.findUnique({
      where: { ownerId_slug: { ownerId: owner.id, slug: collectionSlug } },
      select: { id: true },
    })

    let collectionId: string

    if (existing) {
      collectionId = existing.id
    } else {
      const created = await prisma.collection.create({
        data: {
          ownerId: owner.id,
          slug: collectionSlug,
          title: c.title,
          description: c.description,
          coverUrl: c.coverUrl,
          isPublic: c.isPublic,
          aiEnabled: c.aiEnabled,
        },
        select: { id: true },
      })
      collectionId = created.id
    }

    collectionMap.set(c.title, collectionId)

    // Items
    for (let i = 0; i < c.linkKeys.length; i++) {
      const linkId = linkMap.get(c.linkKeys[i])!
      await prisma.collectionItem.upsert({
        where: { collectionId_linkId: { collectionId, linkId } },
        update: { position: i },
        create: { collectionId, linkId, position: i },
      })
    }

    // Tags
    for (const tagName of c.tags) {
      const tagId = tagMap.get(tagName)!
      await prisma.collectionTag.upsert({
        where: { collectionId_tagId: { collectionId, tagId } },
        update: {},
        create: { collectionId, tagId },
      })
    }

    console.log(`  ✓ collection "${c.title}" (@${c.ownerKey})`)
  }

  // 5. User follows (follower → following)
  const follows: [string, string][] = [
    ['bob', 'alice'],
    ['cleo', 'alice'],
    ['mia', 'alice'],
    ['alice', 'bob'],
    ['cleo', 'mia'],
    ['mia', 'bob'],
  ]

  for (const [followerKey, followingKey] of follows) {
    const followerId = userMap.get(followerKey)!.id
    const followingId = userMap.get(followingKey)!.id
    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      update: {},
      create: { followerId, followingId },
    })
  }
  console.log(`  ✓ ${follows.length} user follows`)

  // 6. Collection likes
  const likes: [string, string][] = [
    ['bob', 'Design Fundamentals'],
    ['cleo', 'Design Fundamentals'],
    ['mia', 'Design Fundamentals'],
    ['alice', 'TypeScript Deep Cuts'],
    ['mia', 'TypeScript Deep Cuts'],
    ['cleo', 'Research Toolkit'],
    ['alice', 'Indie Hacker Starter Pack'],
    ['bob', 'Indie Hacker Starter Pack'],
    ['alice', 'UI Inspiration'],
  ]

  for (const [userKey, collectionTitle] of likes) {
    const userId = userMap.get(userKey)!.id
    const collectionId = collectionMap.get(collectionTitle)!
    await prisma.like.upsert({
      where: { userId_collectionId: { userId, collectionId } },
      update: {},
      create: { userId, collectionId },
    })
  }
  console.log(`  ✓ ${likes.length} collection likes`)

  // 7. Collection follows
  const collectionFollows: [string, string][] = [
    ['bob', 'Design Fundamentals'],
    ['mia', 'Design Fundamentals'],
    ['alice', 'TypeScript Deep Cuts'],
    ['cleo', 'TypeScript Deep Cuts'],
    ['mia', 'Research Toolkit'],
    ['alice', 'Indie Hacker Starter Pack'],
  ]

  for (const [userKey, collectionTitle] of collectionFollows) {
    const userId = userMap.get(userKey)!.id
    const collectionId = collectionMap.get(collectionTitle)!
    await prisma.collectionFollow.upsert({
      where: { userId_collectionId: { userId, collectionId } },
      update: {},
      create: { userId, collectionId },
    })
  }
  console.log(`  ✓ ${collectionFollows.length} collection follows`)

  // 8. Comments
  type CommentDef = { authorKey: string; collectionTitle: string; body: string; replyTo?: number }
  const comments: CommentDef[] = [
    {
      authorKey: 'bob',
      collectionTitle: 'Design Fundamentals',
      body: 'Refactoring UI changed how I think about spacing. Highly recommend starting there.',
    },
    {
      authorKey: 'cleo',
      collectionTitle: 'Design Fundamentals',
      body: 'Happy Hues is a gem — I use it every single project.',
    },
    {
      authorKey: 'alice',
      collectionTitle: 'Design Fundamentals',
      body: '@bob Agreed, Steve Schoger\'s examples are so concrete.',
      replyTo: 0,
    },
    {
      authorKey: 'mia',
      collectionTitle: 'TypeScript Deep Cuts',
      body: 'The ts-reset library is underrated. JSON.parse returning unknown is the right call.',
    },
    {
      authorKey: 'bob',
      collectionTitle: 'TypeScript Deep Cuts',
      body: 'Effect is the one I keep coming back to even though the learning curve is steep.',
    },
    {
      authorKey: 'alice',
      collectionTitle: 'Indie Hacker Starter Pack',
      body: 'PG essays + Stripe Atlas is the combination every first-time founder should read.',
    },
    {
      authorKey: 'cleo',
      collectionTitle: 'Indie Hacker Starter Pack',
      body: 'The Stripe Atlas pricing guides are surprisingly practical.',
      replyTo: 5,
    },
    {
      authorKey: 'bob',
      collectionTitle: 'Research Toolkit',
      body: 'Connected Papers is incredible for lit reviews. Saved me hours.',
    },
  ]

  const createdCommentIds: string[] = []
  for (const c of comments) {
    const authorId = userMap.get(c.authorKey)!.id
    const collectionId = collectionMap.get(c.collectionTitle)!
    const parentId =
      c.replyTo !== undefined ? createdCommentIds[c.replyTo] : undefined

    const comment = await prisma.comment.create({
      data: {
        authorId,
        collectionId,
        body: c.body,
        parentId: parentId ?? null,
      },
      select: { id: true },
    })
    createdCommentIds.push(comment.id)
  }
  console.log(`  ✓ ${comments.length} comments`)

  // 9. AI suggestions (on bob's TypeScript collection)
  const tsColl = collectionMap.get('TypeScript Deep Cuts')!
  const aiSuggestions = [
    {
      url: 'https://github.com/type-challenges/type-challenges',
      title: 'type-challenges',
      reasoning: 'Hands-on exercises that build deep intuition for TypeScript\'s type system.',
    },
    {
      url: 'https://www.typescriptlang.org/play',
      title: 'TypeScript Playground',
      reasoning: 'The fastest way to experiment with and share TypeScript snippets.',
    },
    {
      url: 'https://ts-toolbelt.pirix-gh.io',
      title: 'ts-toolbelt',
      reasoning: 'The most comprehensive TypeScript utility type library, complementing the built-in helpers.',
    },
    {
      url: 'https://trpc.io',
      title: 'tRPC',
      reasoning: 'End-to-end typesafe APIs — a perfect companion when working with TypeScript on both client and server.',
    },
    {
      url: 'https://www.youtube.com/@mattpocockuk',
      title: 'Matt Pocock on YouTube',
      reasoning: 'Short, focused TypeScript videos from the author of Total TypeScript.',
    },
  ]

  await prisma.aISuggestion.deleteMany({ where: { collectionId: tsColl, dismissed: false } })
  await prisma.aISuggestion.createMany({
    data: aiSuggestions.map((s) => ({ ...s, collectionId: tsColl })),
  })
  console.log(`  ✓ ${aiSuggestions.length} AI suggestions on "TypeScript Deep Cuts"`)

  console.log('\n✅  Seed complete.')
  console.log('\nSeeded users:')
  for (const u of USERS) {
    console.log(`  @${u.username.padEnd(10)} firebaseUid=${u.firebaseUid}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
