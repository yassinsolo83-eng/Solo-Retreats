/**
 * Remembers where a visitor first came from (Instagram, a WhatsApp link, Google...),
 * so each booking request shows it under "Came from" in the studio.
 * Tip: add ?utm_source=instagram to the link in your Instagram bio.
 */
const KEY = 'sr_source'

export function captureAttribution() {
  try {
    const params = new URLSearchParams(window.location.search)
    const utm = ['utm_source', 'utm_medium', 'utm_campaign'].map((k) => params.get(k)).filter(Boolean).join(' / ')
    const ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''
    const external = ref && ref !== window.location.hostname.replace(/^www\./, '')
    if (utm) localStorage.setItem(KEY, utm)
    else if (!localStorage.getItem(KEY)) localStorage.setItem(KEY, external ? ref : 'Direct / WhatsApp / typed link')
  } catch {}
}

export function getAttribution() {
  try {
    return localStorage.getItem(KEY) || ''
  } catch {
    return ''
  }
}
