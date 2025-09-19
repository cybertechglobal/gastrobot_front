import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false, // ⬅️ ovde isključiš Strict Mode

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gastrobot-dev.s3.eu-west-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
