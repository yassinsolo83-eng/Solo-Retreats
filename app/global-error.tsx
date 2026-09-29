'use client'

/** Last-resort error screen if the whole site layout fails. Kept dependency-free on purpose. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f6f3ed', color: '#24332d', fontFamily: 'Georgia, serif', padding: 24 }}>
        <div style={{ maxWidth: 480 }}>
          <h1 style={{ fontSize: 44, fontWeight: 400, margin: 0 }}>Something went wrong</h1>
          <p style={{ fontFamily: 'system-ui, sans-serif', color: '#5f6b64', fontSize: 18, lineHeight: 1.6 }}>The site didn't load properly. Please try again in a moment.</p>
          <button type="button" onClick={reset} style={{ marginTop: 16, minHeight: 48, padding: '0 28px', border: 0, borderRadius: 999, background: '#26473d', color: '#f6f3ed', fontSize: 16, cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
