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
