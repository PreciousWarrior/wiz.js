import { babel } from '@rollup/plugin-babel'
import filesize from 'rollup-plugin-filesize'
import { terser } from 'rollup-plugin-terser'

const production = !process.env.ROLLUP_WATCH

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.esm.js',
    format: 'esm',
  },
  external: [/@babel\/runtime/, 'axios'],
  plugins: [
    babel({
      exclude: [
        'node_modules/**',
        'src/data/auth.js',
      ],
      babelHelpers: 'runtime',
      plugins: ['@babel/plugin-transform-runtime'],
    }),

    filesize(),
    production && terser()
  ],
}
