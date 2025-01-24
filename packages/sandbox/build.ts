import { type BuildConfig, build } from "bun";

let conf: BuildConfig = {
  entrypoints: ["src/bundle.ts"],
  outdir: "dist",
  format: "esm",
  target: "node",
  conditions: ["react-server"],
};

await build(conf);
