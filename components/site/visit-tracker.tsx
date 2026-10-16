'use client'

import { useEffect } from 'react'

/** Counts this browser once. When the cookie is already there it makes no request at all. */
export function VisitTracker() {
  useEffect(() => {
    if (document.cookie.split('; ').some((c) => c.startsWith('solo_v='))) return
    fetch('/api/visit', { method: 'POST', keepalive: true }).catch(() => {})
  }, [])
  return null
}
