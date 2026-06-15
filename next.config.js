/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api2.diarioinfo.com', 'localhost', 'res.cloudinary.com'],
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
}
module.exports = nextConfig