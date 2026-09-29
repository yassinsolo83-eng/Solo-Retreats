import { NextStudio } from 'next-sanity/studio'
import config from '../../sanity.config'

// Every /studio/* address is sent here by the rewrite in next.config.mjs,
// so the studio works without a catch-all [[...tool]] folder.
export const dynamic = 'force-static'
export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  return <NextStudio config={config} />
}
