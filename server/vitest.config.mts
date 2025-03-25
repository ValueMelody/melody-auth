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
        'src/scripts',
        'src/configs/type.ts',
        'src/pages/views',
        'src/**/__tests__',
        'src/adapters',
        'src/node.tsx',
        '**/*.test.ts',
        '**/*.test.tsx'
      ],
    },
  },
})
