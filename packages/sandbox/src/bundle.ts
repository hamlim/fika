import { PassThrough, type Readable } from "node:stream";
import {
  registerClientReference as originalRegisterClientReference,
  registerServerReference as originalRegisterServerReference,
  renderToPipeableStream,
} from "@matthamlin/react-server-dom-esm/server";
import type React from "react";
// let res = renderToPipeableStream(<div>Hello, world!</div>);

// Convert the pipeable stream to a ReadableStream
// const stream = convertPipeToReadableStream(res.pipe);

// function convertPipeToReadableStream(
//   pipe: (writable: Writable) => void,
// ): ReadableStream<Uint8Array> {
//   // Create a queue to store the written chunks
//   const queue: Uint8Array[] = [];
//   let isFinished = false;

//   // Create a custom writable to capture data
//   const writable = new Writable({
//     write(chunk, encoding, callback) {
//       // Store the chunk as Uint8Array
//       const buffer = Buffer.isBuffer(chunk)
//         ? chunk
//         : Buffer.from(chunk, encoding);
//       queue.push(buffer);
//       callback(); // Signal that writing is done
//     },
//     final(callback) {
//       isFinished = true;
//       callback(); // Signal that the stream is finished
//     },
//   });

//   // Call the provided `pipe` function with the custom writable
//   pipe(writable);

//   // Create a ReadableStream that pulls data from the queue
//   return new ReadableStream<Uint8Array>({
//     pull(controller) {
//       // Push chunks from the queue to the readable stream
//       while (queue.length > 0) {
//         controller.enqueue(queue.shift()!);
//       }

//       // If the writable is finished and the queue is empty, close the readable stream
//       if (isFinished && queue.length === 0) {
//         controller.close();
//       }
//     },
//     cancel() {
//       // Handle cleanup
//       queue.length = 0;
//     },
//   });
// }

// // console.log(stream);

// // Consume the ReadableStream
// // (async () => {
// //   const reader = stream.getReader();
// //   let result = "";
// //   while (true) {
// //     const { value, done } = await reader.read();
// //     if (done) break;
// //     console.log(value);
// //     result += new TextDecoder().decode(value);
// //   }
// //   console.log(result); // Outputs: "Hello, world!"
// // })();

// export function renderToReadableStream(
//   stuff: React.ReactNode,
// ): ReadableStream<Uint8Array> {
//   let res = renderToPipeableStream(stuff);
//   return convertPipeToReadableStream(res.pipe);
// }

// @TODO - we probably don't need the above stuff
export function renderToNodeStream(
  stuff: React.ReactNode,
  moduleBasePath: string,
): Readable {
  let res = renderToPipeableStream(stuff, moduleBasePath);
  let passThrough = new PassThrough();
  return res.pipe(passThrough);
}

export function registerClientReference(name: string, url: string) {
  return originalRegisterClientReference(
    () => {
      throw new Error(
        `Attempted to call ${name}() from the server but ${name} is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.`,
      );
    },
    url,
    name,
  );
}

export function registerServerReference(fn: any, url: string, name: string) {
  return originalRegisterServerReference(fn, url, name);
}
