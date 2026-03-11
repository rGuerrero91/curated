import { getPresignedPutUrl, toPublicUrl } from '../../lib/r2.js'

type Resource = 'avatar' | 'collection-cover'

export async function getSignedUploadUrl(userId: string, resource: Resource) {
  const timestamp = Date.now()
  const key = resource === 'avatar'
    ? `avatars/${userId}/${timestamp}.webp`
    : `covers/${userId}/${timestamp}.webp`

  const uploadUrl = await getPresignedPutUrl(key, 'image/webp')
  const publicUrl = toPublicUrl(key)

  return { uploadUrl, key, publicUrl }
}
