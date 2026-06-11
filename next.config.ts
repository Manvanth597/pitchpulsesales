import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/agents',
        destination: '/settings/agents',
        permanent: true,
      },
      {
        source: '/agent-network',
        destination: '/settings/network',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
