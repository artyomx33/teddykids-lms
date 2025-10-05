import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { execSync } from "child_process";
import { componentTagger } from "lovable-tagger";

// Build-time globals
const COMMIT = execSync("git rev-parse --short HEAD").toString().trim();
const BUILD_TIME = new Date().toISOString();

// Development Environment Surgeon - Surgical Vite Configuration
// Zero-tolerance optimization for pristine development experience
export default defineConfig(({ mode }) => ({
  // Chrome Detective Configuration - Extension compatibility with surgical precision
  server: {
    host: "::",
    port: 8080,
    strictPort: true, // Prevent port conflicts
    fs: {
      // Secure file serving with minimal overhead
      allow: ['..'],
      strict: true
    },
    // Surgical HMR optimization - zero noise, maximum speed
    hmr: {
      overlay: false, // Disable error overlay that conflicts with extensions
      clientPort: 8080,
      port: 8080
    },
    // Optimized file watching for instant updates
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/coverage/**',
        '**/.nyc_output/**',
        '**/.cache/**'
      ],
      usePolling: false, // Use native file events for better performance
      interval: 100
    },
    // Development server optimization
    middlewareMode: false,
    cors: true,
    open: false // Prevent auto-opening conflicting browsers
  },

  // Surgical build optimization for development speed
  build: {
    target: 'esnext',
    minify: mode === 'development' ? false : 'esbuild',
    sourcemap: true,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Strategic code splitting for optimal loading
          vendor: ['react', 'react-dom'],
          ui: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip'
          ],
          utils: ['clsx', 'class-variance-authority', 'tailwind-merge'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          data: ['@tanstack/react-query', '@supabase/supabase-js']
        }
      }
    },
    // Optimized chunk size warnings
    chunkSizeWarningLimit: 1000
  },

  // Surgical dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'lucide-react',
      'clsx',
      'tailwind-merge'
    ],
    exclude: [
      '@vite/client',
      '@vite/env'
    ],
    // Force dependency re-bundling for consistency
    force: false
  },

  // Clean plugin configuration
  plugins: [
    react({
      // SWC optimization for maximum speed
      jsxImportSource: '@emotion/react',
      babel: false,
      plugins: []
    }),
    // Component tagger only in development
    mode === 'development' && componentTagger()
  ].filter(Boolean),

  // Build-time constants with zero runtime overhead
  define: {
    __BUILD_HASH__: JSON.stringify(COMMIT),
    __BUILD_TIME__: JSON.stringify(BUILD_TIME),
    __DEV__: mode === 'development',
    __PROD__: mode === 'production'
  },

  // Clean path resolution
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@types": path.resolve(__dirname, "./src/types")
    }
  },

  // CSS optimization
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },

  // ESBuild optimization for maximum speed
  esbuild: {
    target: 'esnext',
    keepNames: true,
    minifySyntax: mode !== 'development',
    minifyWhitespace: mode !== 'development',
    minifyIdentifiers: mode !== 'development'
  },

  // JSON optimization
  json: {
    namedExports: true,
    stringify: false
  },

  // Environment variable configuration
  envPrefix: 'VITE_',
  envDir: '.',

  // Clean cache configuration
  cacheDir: 'node_modules/.vite',

  // Clear screen on rebuild for clean development
  clearScreen: mode === 'development'
}));