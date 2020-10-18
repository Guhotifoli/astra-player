import path from 'path';
import sass from 'rollup-plugin-sass';
import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2';
import sourceMaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';

const masterVersion = require('./package.json').version;
const packagesDir = path.resolve(__dirname, 'packages');
const packageDir = path.resolve(packagesDir, process.env.TARGET);
const name = path.basename(packageDir);
const resolve = (p) => path.resolve(packageDir, p);
const pkg = require(resolve(`package.json`));
const packageOptions = pkg.buildOptions || {};

const outputConfigs = {
  min: {
    file: resolve(`dist/${name}.min.js`),
    format: `iife`,
    name: 'AstraPlayer',
  },
  esm: {
    file: resolve(`dist/${name}.esm.js`),
    format: `es`,
  },
  umd: {
    file: resolve(`dist/${name}.js`),
    format: `umd`,
    name: 'AstraPlayer',
  },
};

const defaultFormats = ['esm', 'umd', 'min'];
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split(',');
const packageFormats =
  inlineFormats || packageOptions.formats || defaultFormats;
const packageConfigs = packageFormats.map((format) =>
  createConfig(format, outputConfigs[format])
);

export default packageConfigs;

function createConfig(format, output, plugins = []) {
  if (!output) {
    console.log(require('chalk').yellow(`invalid format: "${format}"`));
    process.exit(1);
  }

  const typescriptPlugin = typescript({
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: true,
        declaration: true,
      },
    },
  });

  return {
    input: resolve(`src/index.ts`),
    plugins: [
      typescriptPlugin,
      sourceMaps(),
      json(),
      sass({ output: resolve(`dist/${name}.css`) }),
      terser({
        module: /^esm/.test(format),
      }),
      ...plugins,
    ],
    output,
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg);
      }
    },
  };
}
