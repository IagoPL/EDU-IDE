/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Optimizaciones de rendimiento
  reactStrictMode: false, // Desactivar para dev más rápido
  
  webpack: (config, { isServer, dev }) => {
    // Cachear para mejor rendimiento
    if (dev) {
      config.cache = {
        type: 'filesystem',
      }
    }
    
    // Fallbacks para módulos no disponibles en cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        path: false,
      }
    }
    
    // NO cargar monaco-editor para mejorar rendimiento
    config.externals = config.externals || []
    if (!isServer) {
      config.externals.push({
        'monaco-editor': 'monaco-editor',
      })
    }
    
    // Optimizar chunks
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          cacheGroups: {
            default: false,
            vendors: false,
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              priority: 10,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
                return `npm.${packageName.replace('@', '')}`
              },
              priority: 20,
            },
          },
        },
      }
    }
    
    return config
  },
  
  compiler: {
    removeConsole: false,
  },
  
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-scroll-area', '@radix-ui/react-switch'],
  },
}

export default nextConfig
