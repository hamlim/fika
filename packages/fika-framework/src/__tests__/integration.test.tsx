import { expect, test } from "bun:test";

import { Hono } from "hono";

import { handler } from "../handler.server";
import type { Route } from "../router";
import { makeStorageMiddleware } from "../storage.server";

function GreetingPage() {
  return <div>Hello</div>;
}

function NotFoundPage() {
  return <div>Not Found</div>;
}

async function GreetingHandler() {
  return new Response(JSON.stringify({ hello: "world" }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

let routes: Array<[string, Route]> = [
  [
    "/",
    {
      $type: "custom",
      rawPath: "/",
      routeType: "static",
      params: [],
      filePath: "",
      type: "page",
      mod: () => Promise.resolve({ default: GreetingPage }),
    },
  ],
  [
    "/api/hello",
    {
      $type: "custom",
      rawPath: "/api/hello",
      routeType: "static",
      params: [],
      filePath: "",
      type: "api",
      mod: () =>
        Promise.resolve({
          default: GreetingHandler,
        }),
    },
  ],
  [
    "/@not-found",
    {
      $type: "not-found",
      rawPath: "/",
      routeType: "static",
      params: [],
      filePath: "/@not-found",
      type: "page",
      mod: () => Promise.resolve({ default: NotFoundPage }),
    },
  ],
];

let importMap = {
  imports: {
    react: "react",
  },
};

test("fika-framework - page", async () => {
  let app = new Hono();
  app.use(
    makeStorageMiddleware({
      routes,
      importMap,
      bootstrapModules: ["./entry.client.js"],
    }),
  );
  app.use("*", handler);

  let res = await app.request("http://localhost:3000/");
  expect(res.status).toBe(200);
  expect(await res.text()).toContain("<div>Hello</div>");
});

test("fika-framework - api handler", async () => {
  let app = new Hono();
  app.use(
    makeStorageMiddleware({
      routes,
      importMap,
      bootstrapModules: ["./entry.client.js"],
    }),
  );
  app.use("*", handler);

  let res = await app.request("http://localhost:3000/api/hello");
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ hello: "world" });
});

test("fika-framework - not found", async () => {
  let app = new Hono();
  app.use(
    makeStorageMiddleware({
      routes,
      importMap,
      bootstrapModules: ["./entry.client.js"],
    }),
  );
  app.use("*", handler);

  let res = await app.request("http://localhost:3000/foo-bar");
  expect(res.status).toBe(404);
  expect(await res.text()).toContain("<div>Not Found</div>");
});
