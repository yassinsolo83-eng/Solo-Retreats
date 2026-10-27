'use client'

import { createContext, useContext, useState } from 'react'

type Lang = 'en' | 'ar'
const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'en', setLang: () => {} })

/** Holds the page language. Wrap a page's content with it, then use <LangToggle /> and <Lang /> inside. */
export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

/** English / Arabic switch. Render it only when the page has Arabic text. */
export function LangToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useContext(LangContext)
  const base = 'min-h-9 rounded-full px-4 text-sm transition-colors'
  return (
    <div role="group" aria-label="Language" className={`inline-flex gap-1 rounded-full bg-dune p-1 ${className}`}>
      <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')} className={`${base} ${lang === 'en' ? 'bg-pine text-sand' : 'text-stone hover:text-ink'}`}>English</button>
      <button type="button" aria-pressed={lang === 'ar'} onClick={() => setLang('ar')} className={`${base} ${lang === 'ar' ? 'bg-pine text-sand' : 'text-stone hover:text-ink'}`}>Arabic</button>
    </div>
  )
}

/** Shows `ar` (right-to-left) when Arabic is chosen and exists, otherwise `en`. */
export function Lang({ en, ar }: { en?: React.ReactNode; ar?: React.ReactNode }) {
  const { lang } = useContext(LangContext)
  if (lang === 'ar' && ar) return <div dir="rtl" lang="ar">{ar}</div>
  return <>{en}</>
}
