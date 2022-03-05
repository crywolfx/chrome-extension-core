import typescript from 'rollup-plugin-typescript2';

import resolve from 'rollup-plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: {
    index: './packages/index.ts',
    event: './packages/event.ts',
    store: './packages/store.ts',
    tab: './packages/tab.ts',
  },
  output: {
    exports: 'auto',
    dir: './lib',
    format: 'esm',
  },
  watch: {
    include: 'packages/**',
  },
  plugins: [
    typescript({ useTsconfigDeclarationDir: true }),
    commonjs(),
    resolve()
  ]
}
