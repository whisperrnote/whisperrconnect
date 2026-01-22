import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'lucide-react',
      'date-fns',
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
