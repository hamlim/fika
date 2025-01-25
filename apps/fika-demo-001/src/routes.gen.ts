/** Automatically Generated! */
import type { Route } from "@fika-ts/framework/router";

export let routes: Array<[string, Route]> = [
  [
    "/",
    {
      routeType: "static",
      rawPath: "/",
      filePath: "/index.page.js",
      type: "page",
      params: [],
      $type: "custom",
      mod: () => import("./index.page.js")
    }
  ],
  [
    "/api/greet",
    {
      routeType: "static",
      rawPath: "/api/greet",
      filePath: "/api/greet.route.js",
      type: "api",
      params: [],
      $type: "custom",
      mod: () => import("./api/greet.route.js")
    }
  ],
  [
    "/@not-found",
    {
      $type: "not-found",
      routeType: "static",
      rawPath: "/",
      filePath: "/@not-found.page.js",
      type: "page",
      params: [],
      mod: () => import("./@not-found.page.js")
    }
  ],
  [
    "/api/@not-found",
    {
      $type: "not-found",
      routeType: "static",
      rawPath: "/api/",
      filePath: "/api/@not-found.route.js",
      type: "api",
      params: [],
      mod: () => import("./api/@not-found.route.js")
    }
  ],
];

declare global {
  interface Window {
    __fika_routes: Array<[string, Route]>;
  }
  var __fika_routes: Array<[string, Route]>;
}
globalThis.__fika_routes = routes;
