import path from 'path';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    alias({
      entries: [
        { find: 'shared', replacement: path.resolve(__dirname, 'dist/shared') },
      ],
    }),
    resolve(),
    commonjs(),
    typescript()
  ]
};