import babel from 'rollup-plugin-babel';
import pkg from './package.json';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import {terser} from "rollup-plugin-terser";
const babelConfig = require('./babel.config.js');
export default {
 input: 'src/index.js', // our source file
 output: [
  {
   file: pkg.main,
   format: 'cjs'
  },
  /* {
   file: pkg.module,
   format: 'es' // the preferred format
  } */
 ],
 external: [
  'axios',
  'ws',
  'assert',
  'path',
  'immutable',
  'immutablediff',
  '@hapi/joi',
  'eventemitter3'
 ],
 plugins: [
     
     resolve(),
     
  babel(babelConfig),
 // terser() // minifies generated bundles
 ]
};