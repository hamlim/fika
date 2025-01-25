import { handler } from "@fika-ts/framework/handler.server";
import { makeStorageMiddleware } from "@fika-ts/framework/storage.server";
import { Hono } from "hono";
import { routes } from "./routes.gen.mjs";

let app = new Hono();

app.use(
  makeStorageMiddleware({
    routes,
    importMap: {
      imports: {
        react: "https://esm.sh/react@experimental",
        "react/jsx-runtime": "https://esm.sh/react@experimental/jsx-runtime",
        "react-dom": "https://esm.sh/react-dom@experimental",
        "react-dom/client": "https://esm.sh/react-dom@experimental/client",
        "#framework/storage": "/fika-storage-client.js",
      },
    },
    bootstrapModules: ["/routes.gen.mjs", "/entry.client.js"],
  }),
);

app.use("*", handler);

export default app;
