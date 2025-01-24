import { runBuild } from "hohoro/experimental";

await runBuild({
  rootDirectory: process.cwd(),
  logger: console,
});

// @todo do the two esbuild builds here too
