import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  test: {
    globals: true,
    setupFiles: './vitest.setup.tsx',
    environment: 'jsdom',
  },
})
