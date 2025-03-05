import devServer from '@hono/vite-dev-server'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import build from '@hono/vite-build/node'
import { nodeAdapter } from '@hono/vite-dev-server/node'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(async () => {
  return {
    plugins: [
      tsconfigPaths({ root: './' }),
      tailwindcss(),
      build({ entry: 'src/index.tsx' }),
      devServer({
        adapter: nodeAdapter,
        entry: 'src/node.tsx',
      }),
    ],
  }
})
