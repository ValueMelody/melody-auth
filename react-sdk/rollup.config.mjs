import path from 'path';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.tsx',
  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true,
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM'
    }
  },
  external: ['react', 'react-dom'],
  plugins: [
    alias({
      entries: [
        { find: 'shared', replacement: path.resolve(__dirname, 'dist/shared') },
        { find: 'web-sdk', replacement: path.resolve(__dirname, 'dist/web-sdk') }
      ]
    }),
    resolve(),
    commonjs(),
    typescript()
  ]
};