import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths({ root: './' })],
  test: {
    setupFiles: './src/tests/setup.ts',
    environment: 'node',
    environmentMatchGlobs: [
      ['src/pages/**', 'jsdom'],
    ],
    coverage: {
      reporter: ['text'],
      include: ['src'],
      exclude: [
        'src/tests',
        'src/**/__tests__',
        '**/*.test.ts',
        '**/*.test.tsx',
        'src/adapters',
        'src/node.tsx',
        'src/pages/client.tsx',
        'src/pages/views',
        'src/scripts',
        'src/configs/type.ts',
      ],
    },
  },
})
