import { useEffect, useState } from 'react'
import { useFormValue } from 'sanity'

/**
 * Shown inside each retreat in the studio: ready-made links to the retreat page
 * and to its review form, each with a Copy button. Nothing is saved.
 */
export function RetreatLinks() {
  const slug = useFormValue(['slug', 'current']) as string | undefined
  const [origin, setOrigin] = useState('')
  useEffect(() => setOrigin(window.location.origin), [])

  if (!slug) {
    return <p style={{ margin: 0, fontSize: 14, opacity: 0.7 }}>Press Generate on the Link field above to get the links.</p>
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <LinkRow label="Retreat page (share this to get bookings)" url={`${origin}/retreats/${slug}`} />
      <LinkRow label="Review link (send this to travelers after the trip)" url={`${origin}/review?retreat=${slug}`} />
    </div>
  )
}

function LinkRow({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div>
      <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          style={{
            flex: 1,
            minWidth: 0,
            padding: '8px 10px',
            fontSize: 14,
            fontFamily: 'inherit',
            color: 'inherit',
            background: 'transparent',
            border: '1px solid rgba(128,128,128,.35)',
            borderRadius: 4,
          }}
        />
        <button
          type="button"
          onClick={copy}
          style={{
            padding: '0 14px',
            fontSize: 14,
            fontFamily: 'inherit',
            cursor: 'pointer',
            color: '#fff',
            background: copied ? '#2f7d4f' : '#26473d',
            border: 0,
            borderRadius: 4,
            whiteSpace: 'nowrap',
          }}
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 14, color: 'inherit', border: '1px solid rgba(128,128,128,.35)', borderRadius: 4, textDecoration: 'none' }}
        >
          Open
        </a>
      </div>
    </div>
  )
}
