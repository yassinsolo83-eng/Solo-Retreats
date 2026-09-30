'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { navLinks } from '@/lib/site'
import { Wordmark } from './logo'

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const sunId = useId().replace(/:/g, '')
  const overHero = pathname === '/'

  // Layout effect: read the scroll position before the first paint, so a page opened
  // or refreshed half-way down shows the solid bar straight away.
  useIsomorphicLayoutEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      // Sun in the logo sets over the first ~screen of scrolling and rises again on the way up.
      const progress = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.9)))
      headerRef.current?.style.setProperty('--sun', progress.toFixed(3))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('load', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('load', onScroll)
    }
  }, [])

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // On the home page the bar sits over the photo and turns solid once you scroll.
  const transparent = overHero && !scrolled

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`))

  // Clicking a link to the page you're already on: close the menu and scroll back to the top.
  const handleClick = (href: string) => {
    setOpen(false)
    if (href === pathname) window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        transparent ? 'bg-transparent text-sand' : 'border-b border-ink/10 bg-sand/90 text-ink backdrop-blur-md'
      }`}
    >
      <nav aria-label="Main" className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-10">
        <Link href="/" onClick={() => handleClick('/')} className="-my-2 py-2"><Wordmark className="h-6 w-auto sm:h-7" setting clipId={`sun-${sunId}`} /></Link>
        <div className="hidden items-center gap-8 text-[15px] lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              onClick={() => handleClick(link.href)}
              className={`underline-offset-8 hover:underline ${isActive(link.href) ? 'underline decoration-amber decoration-2' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <button
          type="button"
          className="-mr-2 rounded-full p-2 lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>
    </header>
      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-pine px-5 pb-10 text-sand lg:hidden">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" onClick={() => handleClick('/')} className="-my-2 py-2"><Wordmark className="h-6 w-auto" /></Link>
            <button type="button" className="-mr-2 rounded-full p-2" aria-label="Close menu" onClick={() => setOpen(false)}><X /></button>
          </div>
          <div className="mt-6 flex flex-col">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => handleClick(link.href)} className="border-b border-sand/15 py-4 font-display text-3xl">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
