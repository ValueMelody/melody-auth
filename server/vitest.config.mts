import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: './src/tests/setup.ts',
    coverage: {
      reporter: ['text'],
      include: ['src'],
      exclude: ['src/tests', 'src/scripts', 'src/configs/type.ts'],
    },
  },
})
