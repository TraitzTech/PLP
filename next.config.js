/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
    typescript: {
        // ! This is a temporary fix for the issue with Next.js and TypeScript
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
