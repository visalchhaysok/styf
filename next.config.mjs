/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.50.20', '172.20.10.2', '192.168.50.142'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
