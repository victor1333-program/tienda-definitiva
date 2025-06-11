import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Deshabilitar ESLint durante el build para desarrollo
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Deshabilitar errores de TypeScript durante el build para desarrollo
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Configuración para Hostinger
  trailingSlash: false,
  output: 'standalone',
};

export default nextConfig;
