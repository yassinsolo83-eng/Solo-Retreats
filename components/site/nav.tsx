'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { BRAND, navLinks } from '@/lib/site'

export function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const overHero = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // On the home page the bar sits over the photo and turns solid once you scroll.
  const transparent = overHero && !scrolled

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
    <header
      className={`${overHero ? 'fixed' : 'sticky'} inset-x-0 top-0 z-50 transition-colors duration-300 ${
        transparent ? 'bg-transparent text-sand' : 'border-b border-ink/10 bg-sand/90 text-ink backdrop-blur-md'
      }`}
    >
      <nav aria-label="Main" className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-10">
        <Link href="/" className="font-display text-2xl tracking-tight">{BRAND}</Link>
        <div className="hidden items-center gap-8 text-[15px] lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
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
            <Link href="/" className="font-display text-2xl">{BRAND}</Link>
            <button type="button" className="-mr-2 rounded-full p-2" aria-label="Close menu" onClick={() => setOpen(false)}><X /></button>
          </div>
          <div className="mt-6 flex flex-col">
            {[{ href: '/', label: 'Home' }, ...navLinks].map((link) => (
              <Link key={link.href} href={link.href} className="border-b border-sand/15 py-4 font-display text-3xl">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
