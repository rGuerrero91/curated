import { z } from 'zod'

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().url(),

  // Session — must be 32 random bytes expressed as 64 hex characters
  SESSION_SECRET: z.string().regex(/^[0-9a-f]{64}$/, {
    message: 'SESSION_SECRET must be 64 lowercase hex characters (run: openssl rand -hex 32)',
  }),

  // Firebase Admin
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string(),

  // Cloudflare R2
  R2_ACCOUNT_ID: z.string(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  R2_BUCKET_NAME: z.string(),
  R2_PUBLIC_URL: z.string().url(),

  // Typesense
  TYPESENSE_HOST: z.string(),
  TYPESENSE_PORT: z.coerce.number().default(8108),
  TYPESENSE_API_KEY: z.string(),
  TYPESENSE_PROTOCOL: z.enum(['http', 'https']).default('https'),

  // OpenAI — optional; AI features are disabled when absent
  OPENAI_API_KEY: z.string().min(20).startsWith('sk-').optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('!!! Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
export type Env = z.infer<typeof envSchema>
