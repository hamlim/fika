// @ts-expect-error - untyped
import { createFromReadableStream } from "@matthamlin/react-server-dom-esm/client.browser";
import { use } from "react";
import type { ReactNode } from "react";
// @ts-expect-error - untyped
import { renderToReadableStream as renderHTMLToReadableStream } from "react-dom/server.edge";
import { injectRSCPayload } from "rsc-html-stream/server";

type Options = {
  rscStream: ReadableStream;
};

type Result = {
  stream: ReadableStream;
};

export async function renderRSCToHTML({ rscStream }: Options): Promise<Result> {
  let [s1, s2] = rscStream.tee();

  let root: ReactNode = null;
  function Content(): ReactNode {
    if (root) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      return use(root as any);
    }
    root = createFromReadableStream(s1);
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return use(root as any);
  }

  let htmlStream = await renderHTMLToReadableStream(<Content />, {});

  return { stream: htmlStream.pipeThrough(injectRSCPayload(s2)) };
}
