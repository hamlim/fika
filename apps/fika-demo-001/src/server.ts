import { handler } from "@fika-ts/framework/handler.server";
import { importMapDefaults } from "@fika-ts/framework/import-map-defaults";
import { makeFikaMiddleware } from "@fika-ts/framework/storage.server";
import { Hono } from "hono";
import { routes } from "./routes.gen";
let app = new Hono();

app.use(
  makeFikaMiddleware({
    routes,
    importMap: {
      imports: {
        // add `?dev` to the esm urls for dev assets
        ...importMapDefaults,
      },
    },
    bootstrapModules: ["/routes.gen.js", "/entry.client.js"],
  }),
);

app.use("*", handler);

export default app;
