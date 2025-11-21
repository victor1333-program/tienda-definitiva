/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignorar errores de lint y TypeScript en build de producción
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Optimización para producción
  // output: 'standalone', // Comentado: usando server.js personalizado

  // Configuración de imágenes
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.lovilike.es',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lovilike.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.lovilike.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lovilike.es',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Optimizaciones de rendimiento
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    serverActions: {
      bodySizeLimit: '10mb',
    },
    serverComponentsExternalPackages: ['nodemailer'],
  },
  
  // Configuración de headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  
  // Configuración de redirects
  async redirects() {
    return [
      // Redirect removed - /admin page exists directly
    ]
  },
  
  // Configuración de webpack para resolver errores de módulos
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        canvas: false,
        jsdom: false,
      }

      // Excluir módulos problemáticos que no se usan en el browser
      config.externals = {
        ...config.externals,
        canvas: 'canvas',
        jsdom: 'jsdom',
      }
    } else {
      // En el servidor, marcar nodemailer como externo
      if (!config.externals) {
        config.externals = []
      }

      // Asegurar que nodemailer no sea empaquetado
      if (Array.isArray(config.externals)) {
        config.externals.push('nodemailer')
      }
    }

    // Ignorar archivos binarios problemáticos
    config.module.rules.push({
      test: /\.node$/,
      use: 'ignore-loader'
    })

    return config
  },
}

module.exports = nextConfig