import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import rollupJson from 'rollup-plugin-json'
import commonjs from 'rollup-plugin-commonjs'

const dist = 'dist'
const bundle = 'bundle'

const production = !process.env.ROLLUP_WATCH

export default {
  input: 'src/index.js',
  output: [
    {
      file: `${dist}/${bundle}.esm.js`,
      format: 'esm',
    },
    {
      file: `${dist}/${bundle}.cjs.js`,
      format: 'cjs',
    },
  ],
  plugins: [
    nodeResolve({ jsnext: true, preferBuiltins: true, browser: true }),
    rollupJson(),
    commonjs(),
    babel({
      exclude: [
        'node_modules/**',
        'src/data/auth.js',
      ],
    }),
    production && terser(),
  ],
}
