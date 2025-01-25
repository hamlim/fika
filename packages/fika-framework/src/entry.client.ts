import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import type { Page } from "./router";
import { getStore } from "./storage.client";

let store = getStore();

if (store.route.type === "page") {
  let Component = (await store.route.mod()).default as Page;
  hydrateRoot(
    document,
    createElement(Component, {
      request: store.request,
    }),
  );
} else {
  throw new Error("Unsupported route type");
}
