import chokidar from "chokidar";

import { run } from "@fika-ts/tools";

chokidar
  .watch("./src", {
    ignored(path) {
      return path.endsWith("routes.gen.ts");
    },
  })
  .on("all", () => {
    run({
      projectRoot: "./src",
      outDir: "./dist",
    });
  });

run({
  projectRoot: "./src",
  outDir: "./dist",
});
