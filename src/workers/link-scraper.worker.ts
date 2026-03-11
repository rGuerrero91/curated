/**
 * Link scraper worker.
 *
 * Fired when a new link is submitted. Fetches the URL, extracts Open Graph
 * metadata (title, description, image), downloads and re-encodes the image
 * to WebP, uploads it to Cloudflare R2, then updates the Link row in Postgres.
 *
 * Uses got-scraping (browser-like headers) + cheerio for OG tag parsing.
 * Uses sharp for image re-encoding.
 */
import { Worker, type Job } from 'bullmq'
import { gotScraping } from 'got-scraping'
import * as cheerio from 'cheerio'
import sharp from 'sharp'
import { prisma } from '../lib/prisma.js'
import { r2, toPublicUrl } from '../lib/r2.js'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { env } from '../config/env.js'
import { redis } from '../lib/redis.js'
import type { LinkScraperJob } from './queues.js'

interface OGMeta {
  title?: string
  description?: string
  imageUrl?: string
  faviconUrl?: string
}

async function scrapeOGMeta(url: string): Promise<OGMeta> {
  const response = await gotScraping(url, { timeout: { request: 10_000 } })
  const $ = cheerio.load(response.body)

  const og = (prop: string) =>
    $(`meta[property="og:${prop}"]`).attr('content') ??
    $(`meta[name="${prop}"]`).attr('content')

  const faviconHref =
    $('link[rel="icon"]').attr('href') ??
    $('link[rel="shortcut icon"]').attr('href') ??
    '/favicon.ico'

  const faviconUrl = faviconHref.startsWith('http')
    ? faviconHref
    : new URL(faviconHref, url).toString()

  return {
    title: og('title') ?? $('title').text().trim() || undefined,
    description: og('description') || undefined,
    imageUrl: og('image') || undefined,
    faviconUrl,
  }
}

async function downloadAndUploadImage(imageUrl: string, key: string): Promise<string | null> {
  try {
    const response = await gotScraping(imageUrl, {
      responseType: 'buffer',
      timeout: { request: 10_000 },
    })

    const webpBuffer = await sharp(response.body as Buffer)
      .resize(800, 420, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer()

    await r2.send(
      new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        Body: webpBuffer,
        ContentType: 'image/webp',
      }),
    )

    return toPublicUrl(key)
  } catch {
    return null
  }
}

export function createLinkScraperWorker() {
  return new Worker<LinkScraperJob>(
    'link-scraper',
    async (job: Job<LinkScraperJob>) => {
      const { linkId, url } = job.data

      let meta: OGMeta
      try {
        meta = await scrapeOGMeta(url)
      } catch (err) {
        throw new Error(`Failed to scrape ${url}: ${String(err)}`)
      }

      let thumbnailUrl: string | null = null
      if (meta.imageUrl) {
        const key = `thumbnails/${linkId}/${Date.now()}.webp`
        thumbnailUrl = await downloadAndUploadImage(meta.imageUrl, key)
      }

      await prisma.link.update({
        where: { id: linkId },
        data: {
          title: meta.title,
          description: meta.description,
          thumbnailUrl,
          faviconUrl: meta.faviconUrl,
          scrapedAt: new Date(),
        },
      })
    },
    { connection: redis, concurrency: 5 },
  )
}
