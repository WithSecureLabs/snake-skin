import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import svelte from "rollup-plugin-svelte";
import babel from "@rollup/plugin-babel";
import { terser } from "@rollup/plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import config from "sapper/config/rollup.js";
import copy from "rollup-plugin-copy";
import pkg from "./package.json";

const sapperEnv = () => {
  require("dotenv").config();
  const env = {};
  for (let key in process.env) {
    if (key.startsWith("SNAKE_SKIN_"))
      env[`process.env.${key}`] = `'${process.env[key]}'`;
  }
  return env;
};

const mode = process.env.NODE_ENV;
const dev = mode === "development";
const legacy = !!process.env.SAPPER_LEGACY_BUILD;

const onwarn = (warning, onwarn) =>
  (warning.code === "CIRCULAR_DEPENDENCY" &&
    /[/\\]@sapper[/\\]/.test(warning.message)) ||
  onwarn(warning);
const dedupe = (importee) =>
  importee === "svelte" || importee.startsWith("svelte/");
const ignore = (warning, handler) => {
  // Ignore, cause Bulma...
  if (warning.message === "A11y: <a> element should have an href attribute")
    return;
  // Ignore, cause icons...
  if (warning.message === "A11y: <a> element should have child content") return;
  handler(warning);
};

const preprocess = sveltePreprocess({
  scss: {
    data: `@import 'src/styles/variables.scss';`,
    prependData: `@import 'src/styles/variables.scss';`,
    includePaths: ["node_modules", "src/styles"],
  },
  postcss: {
    plugins: [require("autoprefixer")],
  },
});

export default {
  client: {
    input: config.client.input(),
    output: config.client.output(),
    plugins: [
      replace({
        ...sapperEnv(),
        "process.browser": true,
        "process.env.NODE_ENV": JSON.stringify(mode),
      }),
      copy({
        targets: [
          { src: "node_modules/@mdi/font/fonts/*.woff*", dest: "static/fonts" },
        ],
      }),
      svelte({
        compilerOptions: {
          dev,
          hydratable: true,
        },
        emitCss: true,
        onwarn: ignore,
        preprocess,
      }),
      resolve({
        browser: true,
        dedupe,
      }),
      commonjs(),

      legacy && babel({
				extensions: ['.js', '.mjs', '.html', '.svelte'],
				babelHelpers: 'runtime',
				exclude: ['node_modules/@babel/**'],
				presets: [
					['@babel/preset-env', {
						targets: '> 0.25%, not dead'
					}]
				],
				plugins: [
					'@babel/plugin-syntax-dynamic-import',
					['@babel/plugin-transform-runtime', {
						useESModules: true
					}]
				]
			}),

      !dev &&
        terser({
          module: true,
        }),
    ],

    preserveEntrySignatures: false,
    onwarn,
  },

  server: {
    input: config.server.input(),
    output: config.server.output(),
    plugins: [
      replace({
        ...sapperEnv(),
        "process.browser": false,
        "process.env.NODE_ENV": JSON.stringify(mode),
      }),
      svelte({
        compilerOptions: {
          generate: "ssr",
          dev,
        },
        onwarn: ignore,
        preprocess,
      }),
      resolve({
        dedupe,
      }),
      commonjs(),
    ],
    external: Object.keys(pkg.dependencies).concat(
      require("module").builtinModules ||
        Object.keys(process.binding("natives"))
    ),

    preserveEntrySignatures: 'strict',
    onwarn,
  },

  serviceworker: {
    input: config.serviceworker.input(),
    output: config.serviceworker.output(),
    plugins: [
      resolve(),
      replace({
        ...sapperEnv(),
        "process.browser": true,
        "process.env.NODE_ENV": JSON.stringify(mode),
      }),
      commonjs(),
      !dev && terser(),
    ],

    preserveEntrySignatures: false,
    onwarn,
  },
};
