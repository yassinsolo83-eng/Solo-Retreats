import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Solo Retreats',
    short_name: 'Solo Retreats',
    description: 'Small-group retreats across Egypt.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f3ed',
    theme_color: '#26473d',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
