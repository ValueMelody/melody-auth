import devServer from '@hono/vite-dev-server'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import build from '@hono/vite-build/cloudflare-workers'
import { cloudflareAdapter } from '@hono/vite-dev-server/cloudflare'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(async ({ mode }) => {
  if (mode === 'client') {
    return {
      esbuild: { jsxImportSource: 'hono/jsx/dom' },
      build: {
        rollupOptions: {
          input: './pages/client.tsx',
          output: { entryFileNames: './dist/client.js' },
        },
      },
    }
  }

  return {
    plugins: [
      tsconfigPaths({ root: './' }),
      tailwindcss(),
      build({ entry: 'src/index.tsx' }),
      devServer({
        adapter: cloudflareAdapter,
        entry: 'src/index.tsx',
      }),
    ],
  }
})
