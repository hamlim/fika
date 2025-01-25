/// <reference lib="dom" />
import { type Route, Router } from "./router";
import type { Store } from "./shared-types";

declare global {
  interface Window {
    __fika_routes: Array<[string, Route]>;
    __fika_import_map: {
      imports: Record<string, string>;
    };
    __fika_bootstrap_modules: Array<string>;
  }
  var __fika_routes: Array<[string, Route]>;
  var __fika_import_map: {
    imports: Record<string, string>;
  };
  var __fika_bootstrap_modules: Array<string>;
}

function makeStore(): Store {
  let routes = globalThis.__fika_routes;
  let importMap = globalThis.__fika_import_map;
  let bootstrapModules = globalThis.__fika_bootstrap_modules;

  let router = new Router(routes.map(([_, route]) => route));

  let route = router.match(new URL(window.location.href) as URL);

  if (!route) {
    route = router.findNearestRoute(
      new URL(window.location.href) as URL,
      "not-found",
    );
  }

  if (!route) {
    throw new Error("No route found");
  }

  return {
    request: new Request(window.location.href, {
      method: "GET",
      headers: {
        "content-type": "text/html",
        // this might not actually work
        Cookie: document.cookie,
      },
    }),
    // @TODO: What should be supported?
    context: {},
    route,
    router: router,
    importMap,
    bootstrapModules,
    routes,
  };
}

export function getStore(): Store {
  return makeStore();
}
