import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import app from "./dist/server.js";

app.use("*", serveStatic({ root: "./dist" }));

serve({ fetch: app.fetch, port: 3000 });
