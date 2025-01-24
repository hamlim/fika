import rsf from "@matthamlin/react-server/flight.js";

let { abort, createRequest, startFlowing, startWork, stopFlowing } = rsf;

console.log(rsf.toString());

type TemporaryReference = {};

type Options = {
  environmentName?: string | (() => string);
  filterStackFrame?: (url: string, functionName: string) => boolean;
  onError?: (error: Error) => void;
  onPostpone?: (reason: string) => void;
  identifierPrefix?: string;
  temporaryReferences?: WeakMap<TemporaryReference, string>;
};

// @TODO: typing this would take way too much time
type ReactClientValue = any;

export function renderToReadableStream(
  model: ReactClientValue,
  moduleBasePath: string,
  options: Options,
): ReadableStream {
  let request = createRequest(
    model,
    moduleBasePath,
    options ? options.onError : undefined,
    options ? options.identifierPrefix : undefined,
    options ? options.onPostpone : undefined,
    options ? options.temporaryReferences : undefined,
    process.env.NODE_ENV !== "production" && options
      ? options.environmentName
      : undefined,
    process.env.NODE_ENV !== "production" && options
      ? options.filterStackFrame
      : undefined,
  );

  let stream = new ReadableStream(
    {
      type: "bytes",
      start(_controller): void {
        startWork(request);
      },
      pull(controller): void {
        startFlowing(request, controller);
      },
      cancel(reason): void {
        stopFlowing(request);
        abort(request, reason);
      },
    },
    {
      highWaterMark: 0,
    },
  );

  return stream;
}
