/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    NEXT_PUBLIC_B2B_URL: process.env.NEXT_PUBLIC_B2B_URL || 'https://www.knbiosciences.in',
    NEXT_PUBLIC_B2C_URL: process.env.NEXT_PUBLIC_B2C_URL || 'https://agriculture.knbiosciences.in',
  },
};

module.exports = nextConfig;
