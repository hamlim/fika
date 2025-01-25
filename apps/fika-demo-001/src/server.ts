import { handler } from "@fika-ts/framework/handler.server";
import { makeStorageMiddleware } from "@fika-ts/framework/storage.server";
import { Hono } from "hono";
import { routes } from "./routes.gen";

let app = new Hono();

app.use(
  makeStorageMiddleware({
    routes,
    importMap: {
      imports: {
        // add `?dev` to the esm urls for dev assets
        react: "https://esm.sh/react@experimental",
        "react/jsx-runtime": "https://esm.sh/react@experimental/jsx-runtime",
        "react-dom": "https://esm.sh/react-dom@experimental",
        "react-dom/client": "https://esm.sh/react-dom@experimental/client",
        "#framework/storage": "/storage.client.js",
      },
    },
    bootstrapModules: ["/routes.gen.js", "/entry.client.js"],
  }),
);

app.use("*", handler);

export default app;
