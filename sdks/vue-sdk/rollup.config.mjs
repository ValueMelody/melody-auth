import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true,
    globals: {
      vue: 'Vue',
    }
  },
  external: ['vue'],
  plugins: [
    resolve(),
    commonjs(),
    typescript()
  ]
};