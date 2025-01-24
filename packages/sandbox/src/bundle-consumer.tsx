import { pathToFileURL } from "node:url";
import { createFromNodeStream } from "@matthamlin/react-server-dom-esm/client";
import { type ReactNode, type Usable, use } from "react";
import { renderToReadableStream as renderToHTMLReadableStream } from "react-dom/server";
import {
  registerClientReference,
  registerServerReference,
  renderToNodeStream,
} from "../dist/bundle";

let moduleBasePath = new URL("./", pathToFileURL(__filename)).href;

let onClick = registerClientReference("onClick", `${moduleBasePath}/foo.js`);

let ClientComp = registerClientReference(
  "ClientComp",
  `${moduleBasePath}/foo.js`,
);

async function doAction() {
  console.log("hello world");
}
registerServerReference(doAction, "./actions.js", "doAction");

let nodeStream = renderToNodeStream(
  <div onClick={onClick}>
    Hello, world! <ClientComp action={doAction} />
  </div>,
  moduleBasePath,
);

let root: Usable<Awaited<ReactNode>> | undefined;
function Root() {
  if (root) {
    return use(root);
  }
  root = createFromNodeStream(nodeStream, moduleBasePath, "/") as Usable<
    Awaited<ReactNode>
  >;
  return use(root);
}

let htmlStream = await renderToHTMLReadableStream(<Root />);

(async () => {
  const reader = htmlStream.getReader();
  let result = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    result += new TextDecoder().decode(value);
  }
  console.log(result); // Outputs: "Hello, world!"
})();
