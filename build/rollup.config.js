import fs from 'fs';
import path from 'path';
import vue from 'rollup-plugin-vue';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import minimist from 'minimist';
import typescript from 'rollup-plugin-typescript2';
import css from 'rollup-plugin-css-only';

// Get browserslist config and remove ie from es build targets
const esbrowserslist = fs.readFileSync('./.browserslistrc')
  .toString()
  .split('\n')
  .filter((entry) => entry && entry.substring(0, 2) !== 'ie');

const argv = minimist(process.argv.slice(2));

const projectRoot = path.resolve(__dirname, '..');

const baseConfig = {
  input: 'src/entry.ts',
  plugins: {
    preVue: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      commonjs(),
      alias({
        resolve: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
        entries: {
          '@': path.resolve(projectRoot, 'src'),
        },
      }),
      typescript({
        tsconfigOverride: {
          exclude: [
            'src/serve-dev.ts',
            'tests/**/*',
          ],
        }
      }),
      css({ output: 'dist/styles.css' }),
    ],
    vue: {
      css: false,
      template: {
        isProduction: true,
      },
    },
    babel: {
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
    },
  },
  external: [
    'vue',
    'vue-property-decorator'
  ]
};

// UMD/IIFE shared settings: output.globals
// Refer to https://rollupjs.org/guide/en#output-globals for details
const globals = {
  'vue-property-decorator': 'vuePropertyDecorator',
  vue: 'Vue',
};

// Customize configs for individual targets
const buildFormats = [];

if (!argv.format || argv.format === 'es') {
  const esConfig = {
    ...baseConfig,
    output: {
      file: 'dist/vue-date-range-select.esm.js',
      format: 'esm',
      exports: 'named',
      globals,
    },
    plugins: [
      ...baseConfig.plugins.preVue,
      vue(baseConfig.plugins.vue),
      babel({
        ...baseConfig.plugins.babel,
        presets: [
          [
            '@babel/preset-env',
            {
              targets: esbrowserslist,
            },
          ],
        ],
      }),
    ],
  };
  buildFormats.push(esConfig);
}

if (!argv.format || argv.format === 'cjs') {
  const umdConfig = {
    ...baseConfig,
    output: {
      compact: true,
      file: 'dist/vue-date-range-select.ssr.js',
      format: 'cjs',
      name: 'VueDateRangeInput',
      exports: 'named',
      globals,
    },
    plugins: [
      ...baseConfig.plugins.preVue,
      vue({
        ...baseConfig.plugins.vue,
        template: {
          ...baseConfig.plugins.vue.template,
          optimizeSSR: true,
        },
      }),
      babel(baseConfig.plugins.babel),
    ],
  };
  buildFormats.push(umdConfig);
}

if (!argv.format || argv.format === 'iife') {
  const unpkgConfig = {
    ...baseConfig,
    output: {
      compact: true,
      file: 'dist/vue-date-range-select.min.js',
      format: 'iife',
      name: 'VueDateRangeInput',
      exports: 'named',
      globals,
    },
    plugins: [
      ...baseConfig.plugins.preVue,
      vue(baseConfig.plugins.vue),
      babel(baseConfig.plugins.babel),
      terser({
        output: {
          ecma: 5,
        },
      }),
    ],
  };
  buildFormats.push(unpkgConfig);
}

export default buildFormats;
