import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // keep screenshots clean
  devIndicators: false,
  async redirects() {
    return [
      // The app opens at the sign-in screen.
      { source: "/", destination: "/login", permanent: false },
    ];
  },
};

export default nextConfig;
