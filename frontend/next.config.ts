import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },

  eslint: {
        ignoreDuringBuilds: true,
  },
};

export default nextConfig;