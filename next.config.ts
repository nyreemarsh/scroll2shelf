import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.digitalcontent.marksandspencer.app",
        pathname: "/image/upload/**",
      },
    ],
  },
};

export default nextConfig;
