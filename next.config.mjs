/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sanity Studio lives in app/studio/page.tsx. This sends every deeper studio
  // address (e.g. /studio/structure/retreat) to that same page.
  async rewrites() {
    return [{ source: '/studio/:path+', destination: '/studio' }]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
