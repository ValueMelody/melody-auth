import { resolve } from 'path'
import devServer from '@hono/vite-dev-server'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import build from '@hono/vite-build/cloudflare-workers'
import { cloudflareAdapter } from '@hono/vite-dev-server/cloudflare'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(async ({ mode }) => {
  if (mode === 'client') {
    return {
      plugins: [
        tsconfigPaths({ root: './' }),
        tailwindcss(),
      ],
      esbuild: { jsxImportSource: 'hono/jsx/dom' },
      build: {
        lib: {
          entry: resolve(
            __dirname,
            'src/pages/client.tsx',
          ),
          name: 'client',
          fileName: 'static/client',
        },
      },
    }
  }

  return {
    plugins: [
      tsconfigPaths({ root: './' }),
      tailwindcss(),
      build({ entry: 'src/saml/index.tsx' }),
      devServer({
        adapter: cloudflareAdapter,
        entry: 'src/saml/index.tsx',
      }),
    ],
  }
})
