// @ts-expect-error - untyped
import { renderToPipeableStream } from "@matthamlin/react-server-dom-esm/server";
import { nodeStreamToWebReadable } from "./streams";

type Options = {
  moduleBasePath: string;
  root:
    | React.ReactNode
    | {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        returnValue: any;
        root: React.ReactNode;
      };
};

type Result = {
  stream: ReadableStream;
};

export async function renderRSC({
  moduleBasePath,
  root,
}: Options): Promise<Result> {
  const { pipe } = renderToPipeableStream(root, moduleBasePath);
  let readableStream = nodeStreamToWebReadable(pipe);
  return { stream: readableStream };
}
