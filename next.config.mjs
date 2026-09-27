/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Remove output: 'export' for Netlify deployment
  trailingSlash: false,
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
