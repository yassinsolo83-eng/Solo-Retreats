import { imageUrl } from '@/sanity/lib/image'
import type { SanityImage as SanityImageType } from '@/lib/types'

type Props = {
  image: SanityImageType | null | undefined
  width: number
  height?: number
  alt?: string
  className?: string
  priority?: boolean
  sizes?: string
}

/** Renders a Sanity image resized by Sanity's CDN. Renders a soft placeholder when no image is set. */
export function SanityImage({ image, width, height, alt, className = '', priority, sizes }: Props) {
  const src = imageUrl(image, width, height)
  if (!src) return <div className={`bg-dune-deep ${className}`} aria-hidden="true" />
  const srcSet = [0.5, 1, 1.5]
    .map((f) => {
      const url = imageUrl(image, Math.round(width * f), height ? Math.round(height * f) : undefined)
      return `${url} ${Math.round(width * f)}w`
    })
    .join(', ')
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes ?? `(max-width: 768px) 100vw, ${width}px`}
      alt={alt ?? image?.alt ?? ''}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={`object-cover ${className}`}
    />
  )
}
