/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'images.unsplash.com'],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
}

module.exports = nextConfig
