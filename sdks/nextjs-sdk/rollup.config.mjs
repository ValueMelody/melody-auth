import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const external = [
  'react',
  'react-dom',
  'next',
  'next/navigation',
  'next/headers',
  'next/server',
  '@melody-auth/react',
  '@melody-auth/shared',
  '@melody-auth/web',
  'cookies-next',
  'jose',
];

export default [
  {
    input: 'src/index.tsx',
    output: [
      {
        file: 'dist/index.js',
        format: 'es',
        sourcemap: true,
      },
    ],
    external,
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.ts', '**/*.test.tsx'],
      }),
    ],
  },
  {
    input: 'src/middleware/index.ts',
    output: [
      {
        file: 'dist/middleware/index.js',
        format: 'es',
        sourcemap: true,
      },
    ],
    external,
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.ts', '**/*.test.tsx'],
      }),
    ],
  },
  // Type definitions
  {
    input: 'src/index.tsx',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    external,
    plugins: [dts()],
  },
  {
    input: 'src/middleware/index.ts',
    output: [{ file: 'dist/middleware/index.d.ts', format: 'es' }],
    external,
    plugins: [dts()],
  },
];