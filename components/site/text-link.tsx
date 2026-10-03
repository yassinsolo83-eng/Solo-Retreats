import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

/**
 * The one look for links inside page content: clay color, underline, and an arrow
 * (→ for pages on this site, ↗ for other sites) so people can tell it's clickable.
 * Use `arrow={false}` for links in the middle of a small sentence (e.g. legal lines).
 */
export function TextLink({
  href,
  children,
  icon,
  arrow = true,
  className = '',
}: {
  href: string
  children: ReactNode
  /** Optional icon before the text, e.g. a map pin. */
  icon?: ReactNode
  arrow?: boolean
  className?: string
}) {
  const external = /^(https?:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')
  const Arrow = external ? ArrowUpRight : ArrowRight
  const content = (
    <>
      {icon}
      <span className="text-link-text">{children}</span>
      {arrow && <Arrow aria-hidden="true" className="text-link-arrow" />}
    </>
  )
  const classes = `text-link ${className}`
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={classes}>{content}</a>
  ) : (
    <Link href={href} className={classes}>{content}</Link>
  )
}
