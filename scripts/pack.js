import chalk from "chalk";
import { rollup } from "rollup";
import json from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";
import execa from "execa";
import pSeries from "p-series";

import { resolveCwd, srcRollupEntryPath } from "./paths";
import prepend from "./rollup-plugin-prepend";

async function main() {
  await pSeries([
    () => rollupBuild(),
    () =>
      (async () => {
        await execa("chmod", ["+x", resolveCwd("lib/index.js")]);
      })(),
  ]);

  console.log(chalk`{greenBright 构建成功!}`);
}

async function rollupBuild() {
  const bundle = await rollup({
    input: srcRollupEntryPath,
    external: [
      "update-notifier",

      "cosmiconfig",

      "meow",
      "gradient-string",
      "redent",
      "chalk",

      "is-git-repository",
      "nodegit",

      "deepmerge",

      "async/eachOfSeries",
      "async/asyncify",
    ],
    plugins: [json(), terser(), prepend("#!/usr/bin/env node")],
  });

  await bundle.write({
    dir: resolveCwd("lib"),
    format: "cjs",
  });
}

(async () => {
  try {
    await main();
  } catch (err) {
    throw err;
  }
})();
