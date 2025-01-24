import { Readable } from "node:stream";

/**
 * Wraps a Node.js stream with a web-standard ReadableStream
 * @param {function} nodePipeFunction - Function that returns a Node.js WritableStream when called.
 * @returns {ReadableStream} - A web-standard ReadableStream.
 */
export function nodeStreamToWebReadable(
  nodePipeFunction: (readable: Readable) => void,
): ReadableStream {
  return new ReadableStream({
    start(controller) {
      // Create a Node.js Readable stream
      const readable = new Readable({
        read() {},
      });

      // Use the provided pipe method to pipe into the Node.js readable stream
      nodePipeFunction(readable);

      // Listen for data events to enqueue chunks
      readable.on("data", (chunk) => {
        controller.enqueue(chunk);
      });

      // Listen for end event to close the stream
      readable.on("end", () => {
        controller.close();
      });

      // Handle errors
      readable.on("error", (error) => {
        controller.error(error);
      });
    },
  });
}
