import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
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
    port: 8081,
    strictPort: true, // Prevent port conflicts
    fs: {
      // Secure file serving with minimal overhead
      allow: ['..'],
      strict: true
    },
    // Surgical HMR optimization - zero noise, maximum speed
    hmr: {
      overlay: false, // Disable error overlay that conflicts with extensions
      clientPort: 8081,
      port: 8081
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

  // Vite 7 Best Practices - Let Vite handle chunking automatically
  build: {
    target: 'es2020',
    minify: mode === 'development' ? false : 'esbuild',
    sourcemap: true,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Let Vite 7's intelligent bundler handle chunking
        manualChunks: undefined,
      }
    },
    // Configure module preload for proper loading order
    modulePreload: {
      polyfill: true,
    },
    // Optimized chunk size warnings
    chunkSizeWarningLimit: 1000
  },

  // Vite 7 dependency optimization - minimal, let Vite discover dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@supabase/supabase-js',
      '@tanstack/react-query',
    ],
  },

  // Clean plugin configuration
  plugins: [
    react({
      // SWC optimization for maximum speed
      // Using standard React JSX (not Emotion)
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