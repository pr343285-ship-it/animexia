import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.myanimelist.net" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "static.tvmaze.com" },
    ],
  },
};

export default nextConfig;
