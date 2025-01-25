import { handler } from "@fika-ts/framework/handler.server";
import {
  clientEntryBootstrapModules,
  importMapDefaults,
} from "@fika-ts/framework/runtime-defaults";
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
    bootstrapModules: clientEntryBootstrapModules,
  }),
);

app.use("*", handler);

export default app;
