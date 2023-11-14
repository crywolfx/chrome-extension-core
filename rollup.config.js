import * as path from 'path';
import * as fs from 'fs';
import typescript from 'rollup-plugin-typescript2';

import resolve from 'rollup-plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
const BABEL_ENV = process.env.BABEL_ENV || 'esm';


const entry = 'packages/index.ts';
const coreDir = 'packages/core';
const coreName = fs.readdirSync(path.resolve(coreDir));
const coreEntry = coreName.map((name) => name.match(/\.(ts|tsx|js|jsx)$/) ? `${coreDir}/${name}` : `${coreDir}/${name}/index.ts`);

const input = [entry, ...coreEntry];
const output = {
  preserveModules: true,
  preserveModulesRoot: 'packages',
  exports: 'named',
  dir: './dist/esm',
  format: 'esm',
}


export default () => {
  switch (BABEL_ENV) {
    case 'esm':
      return {
        input: input,
        output: {...output},
        watch: {
          include: 'packages/**',
        },
        plugins: [
          typescript({ useTsconfigDeclarationDir: true }),
          resolve(),
          commonjs(),
        ]
      };
    case 'cjs':
      return {
        input: input,
        output: { ...output, dir: './dist/cjs', format: 'cjs' },
        watch: {
          include: 'packages/**',
        },
        plugins: [
          typescript({ useTsconfigDeclarationDir: true }),
          resolve(),
          commonjs(),
        ]
      };
    default:
      return [];
  }
};