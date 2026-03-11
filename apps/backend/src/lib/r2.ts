/**
 * Cloudflare R2 storage client.
 *
 * R2 is an S3-compatible object store with zero egress fees. We use the AWS
 * SDK v3 S3 client pointed at the R2 endpoint. This module exports the
 * client and a helper to generate presigned PUT URLs so the browser can
 * upload files (profile avatars, collection cover photos, link thumbnails)
 * directly to R2 without passing the binary through the API server.
 */
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { env } from '../config/env.js'

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
})

/**
 * Generate a presigned PUT URL valid for 5 minutes.
 * The client uploads directly to R2; the server then stores the resulting CDN URL.
 */
export async function getPresignedPutUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(r2, command, { expiresIn: 300 })
}

/** Delete an object from R2 by its key. */
export async function deleteObject(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }))
}

/** Convert an R2 object key to its public CDN URL. */
export function toPublicUrl(key: string): string {
  return `${env.R2_PUBLIC_URL}/${key}`
}
