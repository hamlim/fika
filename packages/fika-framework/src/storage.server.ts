import { AsyncLocalStorage } from "node:async_hooks";
import type { Context, MiddlewareHandler, Next } from "hono";
import { Router } from "./router";
import type { Route } from "./router";
import type { Store } from "./shared-types";

let storage = new AsyncLocalStorage<Store>();

/**
 * Get the current store.
 * @returns {Object} The store.
 */
export function getStore(): Store {
  let store = storage.getStore();

  if (!store) {
    throw new Error("Store not found!");
  }

  return store;
}

export function makeStorageMiddleware({
  routes,
  importMap,
  bootstrapModules,
}: {
  routes: Array<[string, Route]>;
  importMap: {
    imports: Record<string, string>;
  };
  bootstrapModules: Array<string>;
}): MiddlewareHandler {
  let router = new Router(routes.map(([_, route]) => route));
  return async function storageMiddleware(context: Context, next: Next) {
    let route = router.match(new URL(context.req.raw.url) as URL);

    if (!route) {
      route = router.findNearestRoute(
        new URL(context.req.raw.url) as URL,
        "not-found",
      );
    }

    if (!route) {
      return new Response("[Fika Middleware] Not found", { status: 404 });
    }

    return await storage.run(
      {
        request: context.req.raw,
        context,
        route,
        router,
        importMap,
        routes,
        bootstrapModules,
      },
      async () => {
        return await next();
      },
    );
  };
}
