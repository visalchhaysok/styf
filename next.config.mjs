/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.50.172', '172.20.10.3'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
