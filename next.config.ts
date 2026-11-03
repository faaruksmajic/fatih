import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  experimental: {
    // The site's root layout sits under [lang] and the admin has its own,
    // so unmatched URLs need a 404 page of their own.
    globalNotFound: true,
  },
};

export default nextConfig;
