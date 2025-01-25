#!/usr/bin/env node

import { run } from "./dist/index.js";

let args = {};
for (let i = 2; i < process.argv.length; i++) {
  let arg = process.argv[i];
  if (arg.startsWith("--")) {
    arg = arg.replace(/^--/, "");
    if (arg.includes("=")) {
      let [key, value] = arg.split("=");
      args[key] = value;
    } else {
      if (process.argv[i + 1] && !process.argv[i + 1].startsWith("--")) {
        args[arg] = process.argv[i + 1];
        i++;
      } else {
        args[arg] = true;
      }
    }
  } else {
    throw new Error(`Invalid argument: ${arg}`);
  }
}

if (args.help) {
  console.log(`Usage: fika --projectRoot=<path> --outDir=<path>`);
  process.exit(0);
}

let status = 0;

if (typeof args.projectRoot !== "string") {
  status = 1;
}

if (typeof args.outDir !== "string") {
  status += 10;
}

if (status > 0) {
  if (status === 1) {
    console.error("Missing --projectRoot");
  }
  if (status === 10) {
    console.error("Missing --outDir");
  }
  process.exit(0);
}

let projectRoot = args.projectRoot;
let outDir = args.outDir;

run({ projectRoot, outDir }).catch(console.error);
