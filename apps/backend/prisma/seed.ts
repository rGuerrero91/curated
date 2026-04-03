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
  {
    firebaseUid: 'seed_uid_jasper_006',
    username: 'jasper',
    displayName: 'Jasper Kim',
    bio: 'Frontend engineer. Open source contributor. Svelte enthusiast.',
    avatarUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=jasper',
    websiteUrl: 'https://jasperkim.dev',
    isPrivate: false,
  },
  {
    firebaseUid: 'seed_uid_nova_007',
    username: 'nova',
    displayName: 'Nova Singh',
    bio: 'ML researcher by day, prompt engineer by night.',
    avatarUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=nova',
    websiteUrl: null,
    isPrivate: false,
  },
  {
    firebaseUid: 'seed_uid_felix_008',
    username: 'felix',
    displayName: 'Felix Oduya',
    bio: 'Product manager. I read strategy docs so you don\'t have to.',
    avatarUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=felix',
    websiteUrl: 'https://felixoduya.com',
    isPrivate: false,
  },
  {
    firebaseUid: 'seed_uid_lena_009',
    username: 'lena',
    displayName: 'Lena Hartmann',
    bio: 'Writer. Collecting the internet one link at a time.',
    avatarUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=lena',
    websiteUrl: 'https://lena.substack.com',
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
  // CSS / animation / frontend
  {
    key: 'josh-comeau',
    url: 'https://www.joshwcomeau.com',
    domain: 'joshwcomeau.com',
    title: 'Josh W. Comeau',
    description: 'Friendly, in-depth articles on CSS, React, and animation.',
    thumbnailUrl: 'https://www.joshwcomeau.com/images/og-default.png',
    faviconUrl: 'https://www.joshwcomeau.com/favicon.ico',
  },
  {
    key: 'css-tricks',
    url: 'https://css-tricks.com',
    domain: 'css-tricks.com',
    title: 'CSS-Tricks',
    description: 'Daily articles about CSS, HTML, JavaScript, and all things related to web design and development.',
    thumbnailUrl: null,
    faviconUrl: 'https://css-tricks.com/favicon.ico',
  },
  {
    key: 'motion-one',
    url: 'https://motion.dev',
    domain: 'motion.dev',
    title: 'Motion',
    description: 'A new animation library, built on the Web Animations API.',
    thumbnailUrl: 'https://motion.dev/og.png',
    faviconUrl: 'https://motion.dev/favicon.ico',
  },
  {
    key: 'svelte-docs',
    url: 'https://svelte.dev',
    domain: 'svelte.dev',
    title: 'Svelte',
    description: 'Cybernetically enhanced web apps.',
    thumbnailUrl: 'https://svelte.dev/images/twitter-card.png',
    faviconUrl: 'https://svelte.dev/favicon.png',
  },
  {
    key: 'biome',
    url: 'https://biomejs.dev',
    domain: 'biomejs.dev',
    title: 'Biome',
    description: 'One toolchain for your web project — format, lint, and more.',
    thumbnailUrl: 'https://biomejs.dev/img/og.png',
    faviconUrl: 'https://biomejs.dev/favicon.ico',
  },
  // AI / ML tools
  {
    key: 'hugging-face',
    url: 'https://huggingface.co',
    domain: 'huggingface.co',
    title: 'Hugging Face',
    description: 'The AI community building the future. Models, datasets, and apps.',
    thumbnailUrl: 'https://huggingface.co/og.png',
    faviconUrl: 'https://huggingface.co/favicon.ico',
  },
  {
    key: 'andrej-karpathy',
    url: 'https://www.youtube.com/@AndrejKarpathy',
    domain: 'youtube.com',
    title: 'Andrej Karpathy — YouTube',
    description: 'Neural networks, LLMs, and AI fundamentals explained from first principles.',
    thumbnailUrl: null,
    faviconUrl: 'https://youtube.com/favicon.ico',
  },
  {
    key: 'replicate',
    url: 'https://replicate.com',
    domain: 'replicate.com',
    title: 'Replicate',
    description: 'Run AI models in the cloud with one line of code.',
    thumbnailUrl: 'https://replicate.com/og.png',
    faviconUrl: 'https://replicate.com/favicon.ico',
  },
  {
    key: 'lm-studio',
    url: 'https://lmstudio.ai',
    domain: 'lmstudio.ai',
    title: 'LM Studio',
    description: 'Discover, download, and run local LLMs.',
    thumbnailUrl: 'https://lmstudio.ai/og-image.png',
    faviconUrl: 'https://lmstudio.ai/favicon.ico',
  },
  {
    key: 'openai-cookbook',
    url: 'https://cookbook.openai.com',
    domain: 'cookbook.openai.com',
    title: 'OpenAI Cookbook',
    description: 'Example code and guides for common OpenAI API use cases.',
    thumbnailUrl: null,
    faviconUrl: 'https://cookbook.openai.com/favicon.ico',
  },
  // Product management
  {
    key: 'lenny',
    url: 'https://www.lennysnewsletter.com',
    domain: 'lennysnewsletter.com',
    title: "Lenny's Newsletter",
    description: 'A weekly newsletter about product, growth, and what it takes to build great companies.',
    thumbnailUrl: 'https://www.lennysnewsletter.com/og-image.png',
    faviconUrl: 'https://www.lennysnewsletter.com/favicon.ico',
  },
  {
    key: 'linear-method',
    url: 'https://linear.app/method',
    domain: 'linear.app',
    title: 'The Linear Method',
    description: 'Practices for building products, from the team behind Linear.',
    thumbnailUrl: 'https://linear.app/og-image.png',
    faviconUrl: 'https://linear.app/favicon.ico',
  },
  {
    key: 'shreyas-doshi',
    url: 'https://twitter.com/shreyas',
    domain: 'twitter.com',
    title: 'Shreyas Doshi',
    description: 'Former PM at Stripe, Twitter, Google. Long-form product thinking.',
    thumbnailUrl: null,
    faviconUrl: 'https://twitter.com/favicon.ico',
  },
  // Writing / content
  {
    key: 'substack',
    url: 'https://substack.com',
    domain: 'substack.com',
    title: 'Substack',
    description: 'A place for independent writing.',
    thumbnailUrl: 'https://substack.com/img/substack.png',
    faviconUrl: 'https://substack.com/favicon.ico',
  },
  {
    key: 'hemingway',
    url: 'https://hemingwayapp.com',
    domain: 'hemingwayapp.com',
    title: 'Hemingway Editor',
    description: 'Makes your writing bold and clear.',
    thumbnailUrl: null,
    faviconUrl: 'https://hemingwayapp.com/favicon.ico',
  },
  {
    key: 'george-orwell-politics',
    url: 'https://www.orwell.ru/library/essays/politics/english/e_polit',
    domain: 'orwell.ru',
    title: 'Politics and the English Language — Orwell',
    description: 'The essay on clear writing that every writer should read at least once.',
    thumbnailUrl: null,
    faviconUrl: null,
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
    ownerKey: 'jasper',
    title: 'Frontend Craft',
    description: 'The resources that made me a better frontend developer. CSS, animation, and component design.',
    isPublic: true,
    aiEnabled: true,
    tags: ['frontend', 'css', 'animation', 'web'],
    linkKeys: ['josh-comeau', 'css-tricks', 'motion-one', 'svelte-docs', 'shadcn'],
    coverUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop',
  },
  {
    ownerKey: 'jasper',
    title: 'Toolchain Upgrades',
    description: 'Modern replacements for old dev tools. Faster, stricter, less config.',
    isPublic: true,
    aiEnabled: false,
    tags: ['tools', 'devtools', 'dx', 'javascript'],
    linkKeys: ['biome', 'bundlephobia', 'ray-so'],
    coverUrl: null,
  },
  {
    ownerKey: 'nova',
    title: 'AI Foundations',
    description: 'Start here before reading any paper. The conceptual foundations that everything else builds on.',
    isPublic: true,
    aiEnabled: false,
    tags: ['ai', 'machine-learning', 'learning'],
    linkKeys: ['andrej-karpathy', 'openai-cookbook', 'hugging-face'],
    coverUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop',
  },
  {
    ownerKey: 'nova',
    title: 'Running Models Locally',
    description: 'Tools for running LLMs and image models on your own hardware. No API key required.',
    isPublic: true,
    aiEnabled: false,
    tags: ['ai', 'llm', 'local', 'tools'],
    linkKeys: ['lm-studio', 'replicate', 'hugging-face'],
    coverUrl: null,
  },
  {
    ownerKey: 'felix',
    title: 'PM Reading List',
    description: 'The newsletters, essays, and threads I forward to every new PM I work with.',
    isPublic: true,
    aiEnabled: true,
    tags: ['product', 'management', 'strategy'],
    linkKeys: ['lenny', 'linear-method', 'shreyas-doshi', 'pg-essays', 'stripe-atlas'],
    coverUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop',
  },
  {
    ownerKey: 'felix',
    title: 'Shipping Faster',
    description: 'How great teams cut scope, reduce meetings, and actually ship.',
    isPublic: true,
    aiEnabled: false,
    tags: ['product', 'productivity', 'teams'],
    linkKeys: ['linear-method', 'lenny', 'hn'],
    coverUrl: null,
  },
  {
    ownerKey: 'lena',
    title: 'Writing Well',
    description: 'Everything I\'ve read that made me a cleaner writer. Craft over tools.',
    isPublic: true,
    aiEnabled: false,
    tags: ['writing', 'craft', 'language'],
    linkKeys: ['george-orwell-politics', 'hemingway', 'substack'],
    coverUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop',
  },
  {
    ownerKey: 'lena',
    title: 'Newsletters Worth Subscribing To',
    description: 'The ones that actually stay in my inbox instead of getting archived.',
    isPublic: true,
    aiEnabled: false,
    tags: ['newsletters', 'reading', 'writing'],
    linkKeys: ['lenny', 'substack', 'pg-essays', 'indie-hackers'],
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
    ['jasper', 'alice'],
    ['jasper', 'bob'],
    ['nova', 'cleo'],
    ['nova', 'jasper'],
    ['felix', 'mia'],
    ['felix', 'lena'],
    ['lena', 'cleo'],
    ['lena', 'mia'],
    ['alice', 'jasper'],
    ['bob', 'nova'],
    ['mia', 'felix'],
    ['cleo', 'nova'],
    ['jasper', 'lena'],
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
    ['jasper', 'Design Fundamentals'],
    ['felix', 'Design Fundamentals'],
    ['alice', 'TypeScript Deep Cuts'],
    ['mia', 'TypeScript Deep Cuts'],
    ['jasper', 'TypeScript Deep Cuts'],
    ['nova', 'TypeScript Deep Cuts'],
    ['cleo', 'Research Toolkit'],
    ['nova', 'Research Toolkit'],
    ['lena', 'Research Toolkit'],
    ['alice', 'Indie Hacker Starter Pack'],
    ['bob', 'Indie Hacker Starter Pack'],
    ['felix', 'Indie Hacker Starter Pack'],
    ['lena', 'Indie Hacker Starter Pack'],
    ['alice', 'UI Inspiration'],
    ['jasper', 'UI Inspiration'],
    ['lena', 'Frontend Craft'],
    ['alice', 'Frontend Craft'],
    ['bob', 'Frontend Craft'],
    ['mia', 'Frontend Craft'],
    ['alice', 'AI Foundations'],
    ['bob', 'AI Foundations'],
    ['cleo', 'AI Foundations'],
    ['felix', 'AI Foundations'],
    ['bob', 'PM Reading List'],
    ['mia', 'PM Reading List'],
    ['lena', 'PM Reading List'],
    ['cleo', 'Writing Well'],
    ['mia', 'Writing Well'],
    ['felix', 'Writing Well'],
    ['alice', 'Newsletters Worth Subscribing To'],
    ['nova', 'Running Models Locally'],
    ['bob', 'Running Models Locally'],
    ['jasper', 'Toolchain Upgrades'],
    ['bob', 'Toolchain Upgrades'],
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
    ['jasper', 'Design Fundamentals'],
    ['alice', 'TypeScript Deep Cuts'],
    ['cleo', 'TypeScript Deep Cuts'],
    ['nova', 'TypeScript Deep Cuts'],
    ['mia', 'Research Toolkit'],
    ['nova', 'Research Toolkit'],
    ['alice', 'Indie Hacker Starter Pack'],
    ['felix', 'Indie Hacker Starter Pack'],
    ['alice', 'Frontend Craft'],
    ['bob', 'Frontend Craft'],
    ['cleo', 'AI Foundations'],
    ['bob', 'AI Foundations'],
    ['mia', 'PM Reading List'],
    ['jasper', 'Writing Well'],
    ['mia', 'Writing Well'],
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
    {
      authorKey: 'lena',
      collectionTitle: 'Frontend Craft',
      body: 'Josh Comeau\'s CSS articles are the best technical writing on the internet. Clear and visual.',
    },
    {
      authorKey: 'alice',
      collectionTitle: 'Frontend Craft',
      body: 'Motion is underused. Once you start adding micro-animations the app feels completely different.',
    },
    {
      authorKey: 'jasper',
      collectionTitle: 'Frontend Craft',
      body: '@lena Agreed — his interactive demos are how all technical writing should work.',
      replyTo: 8,
    },
    {
      authorKey: 'bob',
      collectionTitle: 'AI Foundations',
      body: 'Andrej\'s "Neural Networks: Zero to Hero" series is the best free ML course available. No hype, all depth.',
    },
    {
      authorKey: 'cleo',
      collectionTitle: 'AI Foundations',
      body: 'The OpenAI Cookbook is deceptively simple — the embedding examples in particular.',
    },
    {
      authorKey: 'nova',
      collectionTitle: 'AI Foundations',
      body: '@bob Karpathy\'s makemore video made backprop finally click for me after years of hand-waving.',
      replyTo: 11,
    },
    {
      authorKey: 'alice',
      collectionTitle: 'PM Reading List',
      body: 'The Linear Method doc changed how my whole team thinks about prioritisation.',
    },
    {
      authorKey: 'mia',
      collectionTitle: 'PM Reading List',
      body: 'Lenny\'s newsletter is the rare one I read the same day it lands.',
    },
    {
      authorKey: 'jasper',
      collectionTitle: 'Writing Well',
      body: 'The Orwell essay is six rules long and still more useful than any writing course I\'ve taken.',
    },
    {
      authorKey: 'felix',
      collectionTitle: 'Writing Well',
      body: 'Hemingway App is brutal but it\'s usually right. Passive voice everywhere.',
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
