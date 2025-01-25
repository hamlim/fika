import { Fragment, createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import type { Page } from "./router";
import { getStore } from "./storage.client";

let store = getStore();

let metadataContent = document.getElementById("fika-metadata")?.textContent;

if (store.route.type === "page") {
  let Component = (await store.route.mod()).default as Page;
  hydrateRoot(
    document,
    createElement(Fragment, null, [
      createElement(Component, { key: "fika-page", request: store.request }),
      createElement(
        "script",
        {
          key: "fika-metadata",
          type: "module",
          id: "fika-metadata",
        },
        metadataContent,
      ),
    ]),
  );
} else {
  throw new Error("Unsupported route type");
}
