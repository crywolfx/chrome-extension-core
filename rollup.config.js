import * as path from 'path';
import * as fs from 'fs';
import typescript from 'rollup-plugin-typescript2';

import resolve from 'rollup-plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

const BABEL_ENV = process.env.BABEL_ENV || 'esm';

const createEntry = (dir) => {
  const coreDir = dir;
  const coreName = fs.readdirSync(path.resolve(coreDir));
  return coreName.map((name) => name.match(/\.(ts|tsx|js|jsx)$/) ? `${coreDir}/${name}` : `${coreDir}/${name}/index.ts`);
}

const entry = 'packages/index.ts';
const coreEntry = createEntry('packages/core');
const requestEntry = createEntry('packages/request');

const input = [entry, ...coreEntry, ...requestEntry];
const output = {
  preserveModules: true,
  preserveModulesRoot: 'packages',
  exports: 'named',
  dir: './dist/esm',
  format: 'esm',
}

const plugins = [
  typescript({ useTsconfigDeclarationDir: true }),
  json(),
  resolve(),
  commonjs(),
]
const external = ['umi-request'];

export default () => {
  switch (BABEL_ENV) {
    case 'esm':
      return {
        input: input,
        output: { ...output },
        watch: {
          include: 'packages/**',
        },
        plugins,
        external
      };
    case 'cjs':
      return {
        input: input,
        output: { ...output, dir: './dist/cjs', format: 'cjs' },
        watch: {
          include: 'packages/**',
        },
        plugins,
        external
      };
    default:
      return [];
  }
};