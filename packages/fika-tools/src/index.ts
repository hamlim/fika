import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join as pathJoin } from "node:path";
import process from "node:process";
import * as esbuild from "esbuild";
import fastGlob from "fast-glob";
import oxc from "oxc-transform";

import type { ComponentType } from "react";

type MatchedRoute = Route & {
  // record if dynamic, array if catch-all
  matchedParams: Record<string, string | Array<string>>;
};

// temporarily inlining the Route type from the framework
type APIHandler = (
  requesst: Request,
  context: { params: MatchedRoute["matchedParams"] },
) => Promise<Response>;

type Page = ComponentType<{ request: Request }>;

type Route =
  | {
      rawPath: string;
      routeType: "catch-all" | "dynamic" | "static";
      params: string[];
      filePath: string;
      type: "page" | "api";
      $type: "custom" | "not-found" | "error";
      mod: () => Promise<{ default: APIHandler }>;
    }
  | {
      rawPath: string;
      routeType: "catch-all" | "dynamic" | "static";
      params: string[];
      filePath: string;
      type: "page";
      $type: "custom" | "not-found" | "error";
      mod: () => Promise<{ default: Page }>;
    };

function getRouteType(filePath: string): "api" | "page" {
  return basename(filePath).replace(extname(filePath), "").endsWith(".route")
    ? "api"
    : "page";
}

function makeLogger(debug: boolean): (...args: any[]) => void {
  return (...args: any[]): void => {
    if (debug) {
      console.log(...args);
    }
  };
}

type PartialRoute = Omit<Route, "mod">;

export function collectRoutes({
  routeFiles,
  rootDir,
}: { routeFiles: Array<string>; rootDir: string }): Map<string, PartialRoute> {
  let routeManifest = new Map<string, PartialRoute>();

  for (let file of routeFiles) {
    let relativeFilePath = file
      .replace(rootDir.replace(/\.\//, ""), "")
      .replace(/(tsx|ts)/, "js");
    // strip src/ prefix and file extension to get route path
    let routePath = relativeFilePath
      .replace(/\.(route|page)\.(ts|tsx|js|jsx)$/, "")
      .replace(/\/index$/, "/");

    let routeFileName = basename(file);

    // check if path contains dynamic segments
    if (routePath.includes("[")) {
      let params = [];
      let pathParts = routePath.split("/");

      for (let part of pathParts) {
        if (part.startsWith("[...")) {
          // catch-all segment
          params.push(part.slice(4, -1));
          routeManifest.set(routePath, {
            routeType: "catch-all",
            rawPath: routePath,
            filePath: relativeFilePath,
            params,
            type: getRouteType(relativeFilePath),
            $type: "custom",
          });
          break;
        }
        if (part.startsWith("[")) {
          // dynamic segment
          params.push(part.slice(1, -1));
        }
      }

      if (!routeManifest.has(routePath)) {
        routeManifest.set(routePath, {
          routeType: "dynamic",
          rawPath: routePath,
          filePath: relativeFilePath,
          params,
          type: getRouteType(relativeFilePath),
          $type: "custom",
        });
      }
    } else {
      switch (routeFileName.split(".")[0]) {
        case "@not-found": {
          routeManifest.set(routePath, {
            $type: "not-found",
            routeType: "static",
            rawPath: routePath.replace("@not-found", ""),
            filePath: relativeFilePath,
            type: getRouteType(relativeFilePath),
            params: [],
          });
          break;
        }
        case "@error": {
          routeManifest.set(routePath, {
            $type: "error",
            routeType: "static",
            rawPath: routePath.replace("/@error", ""),
            filePath: relativeFilePath,
            type: getRouteType(relativeFilePath),
            params: [],
          });
          break;
        }
        default: {
          routeManifest.set(routePath, {
            routeType: "static",
            rawPath: routePath,
            filePath: relativeFilePath,
            type: getRouteType(relativeFilePath),
            params: [],
            $type: "custom",
          });
        }
      }
    }
  }

  return routeManifest;
}

export async function generate(options: {
  rootDir: string;
  outDir: string;
  debug: boolean;
}): Promise<Array<[string, PartialRoute]>> {
  let logger = makeLogger(options.debug);

  let clientDestinationDir = pathJoin(
    process.cwd(),
    options.rootDir,
    "routes.gen.ts",
  );

  let routeFiles = await fastGlob(
    pathJoin(options.rootDir, "**/*.{route,page}.{ts,tsx,js,jsx}"),
  );

  let routeManifest = collectRoutes({ routeFiles, rootDir: options.rootDir });
  logger("Collected routes, writing manifest...");

  // Currently, the router is "greedy", and will take the first match
  // it finds, meaning it can sometimes accidentally match
  // @not-found or @error routes.
  // To fix this, we sort the routes by type, so that custom routes
  // are always matched first.
  let routeEntries = [...routeManifest.entries()].toSorted(
    ([_, a], [__, b]) => {
      if (a.$type === "custom" && b.$type !== "custom") {
        return -1;
      }
      if (a.$type !== "custom" && b.$type === "custom") {
        return 1;
      }
      return 0;
    },
  );

  let contents = [];
  contents.push(`/** Automatically Generated! */`);
  contents.push(`import type { Route } from "@fika-ts/framework/router";`);
  contents.push(``);
  contents.push(`export let routes: Array<[string, Route]> = [`);
  for (let [path, route] of routeEntries) {
    contents.push(
      `  [
    ${JSON.stringify(path)},
    {
      ${Object.entries(route)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join(",\n      ")},
      mod: () => import(".${route.filePath}")
    }
  ],`,
    );
  }
  contents.push(`];`);

  contents.push(``);
  contents.push(`declare global {`);
  contents.push(`  interface Window {`);
  contents.push(`    __fika_routes: Array<[string, Route]>;`);
  contents.push(`  }`);
  contents.push(`  var __fika_routes: Array<[string, Route]>;`);
  contents.push(`}`);
  contents.push(`globalThis.__fika_routes = routes;`);
  contents.push(``);
  await writeFile(clientDestinationDir, contents.join("\n"));

  logger("Wrote routes.gen.ts");

  return Array.from(routeManifest.entries());
}

export async function build(options: {
  rootDir: string;
  outDir: string;
  routes: Array<[string, PartialRoute]>;
}): Promise<void> {
  let files = await fastGlob(
    pathJoin(process.cwd(), options.rootDir, "**/*.{ts,tsx,js,jsx}"),
  );
  for (let file of files) {
    let srcPath = file;
    let distPath = file
      .replace(
        options.rootDir.replace(/\.\//, ""),
        options.outDir.replace(/\.\//, ""),
      )
      .replace(/(tsx|ts)/, "js");
    let distDir = dirname(distPath);
    if (!existsSync(distDir)) {
      try {
        await mkdir(distDir, { recursive: true });
      } catch {}
    }
    let { code } = oxc.transform(srcPath, await readFile(srcPath, "utf-8"));
    await writeFile(distPath, code);
  }

  // client entry
  await esbuild.build({
    external: ["react", "react-dom"],
    entryPoints: ["@fika-ts/framework/entry.client"],
    outfile: pathJoin(process.cwd(), options.outDir, "entry.client.js"),
    bundle: true,
    minify: true,
    format: "esm",
    target: "es2022",
  });
  // framework files
  await esbuild.build({
    external: ["react", "react-dom"],
    entryPoints: ["@fika-ts/framework/storage.client"],
    outfile: pathJoin(process.cwd(), options.outDir, "storage.client.js"),
    bundle: true,
    minify: true,
    format: "esm",
    target: "es2022",
  });
}

export async function run({
  projectRoot,
  outDir,
  debug = false,
}: {
  projectRoot: string;
  outDir: string;
  debug?: boolean;
}): Promise<void> {
  let logger = makeLogger(debug);
  await mkdir(outDir, { recursive: true });

  let routes = await generate({ rootDir: projectRoot, outDir, debug });

  await build({
    rootDir: projectRoot,
    outDir,
    routes,
  });

  logger("Done");
}
