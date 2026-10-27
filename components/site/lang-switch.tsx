'use client'

import { createContext, useContext, useEffect, useState, type ElementType, type ReactNode } from 'react'

type Lang = 'en' | 'ar'
const STORAGE_KEY = 'solo-lang'

const LangContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void }>({ lang: 'en', setLang: () => {} })

/**
 * Holds the chosen language for the whole site. The choice is remembered in the browser,
 * so a visitor who picks Arabic keeps seeing Arabic on every page that has it.
 */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'ar') setLangState('ar')
    } catch {}
  }, [])

  const setLang = (next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {}
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

/** English / Arabic switch. Render it only on pages that have Arabic text. */
export function LangToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useContext(LangContext)
  const base = 'min-h-10 rounded-full px-5 text-sm font-medium transition-colors'
  return (
    <div role="group" aria-label="Language" className={`inline-flex gap-1 rounded-full bg-dune p-1 ${className}`}>
      <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')} className={`${base} ${lang === 'en' ? 'bg-pine text-sand' : 'text-stone hover:text-ink'}`}>English</button>
      <button type="button" aria-pressed={lang === 'ar'} onClick={() => setLang('ar')} className={`${base} ${lang === 'ar' ? 'bg-pine text-sand' : 'text-stone hover:text-ink'}`}>Arabic</button>
    </div>
  )
}

/**
 * One piece of text in two languages, rendered as the element you choose (h1, p, span...).
 * Shows the Arabic (right-to-left, Arabic font) when Arabic is chosen and exists, otherwise the English.
 */
export function LangText({ as: Tag = 'span', en, ar, className = '' }: { as?: ElementType; en?: ReactNode; ar?: ReactNode; className?: string }) {
  const { lang } = useContext(LangContext)
  const showAr = lang === 'ar' && Boolean(ar)
  if (!showAr && !en) return null
  if (showAr) return <Tag dir="rtl" lang="ar" className={`font-arabic ${className}`}>{ar}</Tag>
  return <Tag className={className}>{en}</Tag>
}

/** Same idea for a bigger block (rich text, a list). Arabic is shown right-to-left in its own wrapper. */
export function LangBlock({ en, ar, className = '' }: { en?: ReactNode; ar?: ReactNode; className?: string }) {
  const { lang } = useContext(LangContext)
  if (lang === 'ar' && ar) return <div dir="rtl" lang="ar" className={`font-arabic ${className}`}>{ar}</div>
  return <>{en}</>
}
