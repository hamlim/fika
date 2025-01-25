import type { Context } from "hono";
import { Fragment, createElement } from "react";
import { renderToReadableStream } from "react-dom/server.browser";
import type { APIHandler, Page } from "./router";
import { getStore } from "./storage.server";

export async function handler(context: Context): Promise<Response> {
  let { route, routes, request, importMap, bootstrapModules } = getStore();

  if (!route) {
    return new Response("Not found", { status: 404 });
  }

  let resolvedModule = await route.mod();

  if (route.type === "page") {
    // SSR

    let scriptContent = [
      `globalThis.__fika_routes = ${JSON.stringify(routes)};`,
      `globalThis.__fika_import_map = ${JSON.stringify(importMap)};`,
      `globalThis.__fika_bootstrap_modules = ${JSON.stringify(bootstrapModules)};`,
    ].join("");

    let Component = resolvedModule.default as Page;
    let stream = await renderToReadableStream(
      createElement(Fragment, null, [
        createElement(Component, { key: "fika-page", request }),
        createElement(
          "script",
          {
            key: "fika-metadata",
            type: "module",
            id: "fika-metadata",
          },
          scriptContent,
        ),
      ]),
      {
        bootstrapModules,
        importMap,
      },
    );
    // @TODO: Should errors use 500? - right now we don't fallback to error routes
    if (route.$type === "not-found") {
      context.status(404);
    } else {
      context.status(200);
    }
    context.header("content-type", "text/html");
    return context.body(stream);
  }

  // API

  let handler = resolvedModule.default as APIHandler;
  return await handler(request, {
    params: route.matchedParams,
  });
}
