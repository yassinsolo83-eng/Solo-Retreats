import { createImageUrlBuilder } from '@sanity/image-url'
import type { SanityImage } from '@/lib/types'
import { dataset, projectId } from '../env'

const builder = createImageUrlBuilder({ projectId: projectId || 'missing', dataset })

export function imageUrl(image: SanityImage | null | undefined, width: number, height?: number) {
  if (!image?.asset) return null
  let b = builder.image(image).width(width).auto('format').quality(80)
  if (height) b = b.height(height).fit('crop')
  return b.url()
}

/**
 * Link-preview image (WhatsApp, Facebook, X). Always a JPEG around 100–200 KB:
 * WhatsApp skips previews that are too heavy or in formats it can't read.
 */
export function ogImageUrl(image: SanityImage | null | undefined) {
  if (!image?.asset) return null
  return builder.image(image).width(1200).height(630).fit('crop').format('jpg').quality(70).url()
}
