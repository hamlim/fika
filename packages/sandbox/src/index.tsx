import { Writable } from "node:stream";
import { renderToPipeableStream } from "@matthamlin/react-server-dom-esm/server";

let res = renderToPipeableStream(<div>Hello, world!</div>);

// Convert the pipeable stream to a ReadableStream
const stream = convertPipeToReadableStream(res.pipe);

function convertPipeToReadableStream(
  pipe: (writable: Writable) => void,
): ReadableStream<Uint8Array> {
  // Create a queue to store the written chunks
  const queue: Uint8Array[] = [];
  let isFinished = false;

  // Create a custom writable to capture data
  const writable = new Writable({
    write(chunk, encoding, callback) {
      // Store the chunk as Uint8Array
      const buffer = Buffer.isBuffer(chunk)
        ? chunk
        : Buffer.from(chunk, encoding);
      queue.push(buffer);
      callback(); // Signal that writing is done
    },
    final(callback) {
      isFinished = true;
      callback(); // Signal that the stream is finished
    },
  });

  // Call the provided `pipe` function with the custom writable
  pipe(writable);

  // Create a ReadableStream that pulls data from the queue
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      // Push chunks from the queue to the readable stream
      while (queue.length > 0) {
        controller.enqueue(queue.shift()!);
      }

      // If the writable is finished and the queue is empty, close the readable stream
      if (isFinished && queue.length === 0) {
        controller.close();
      }
    },
    cancel() {
      // Handle cleanup
      queue.length = 0;
    },
  });
}

// console.log(stream);

// Consume the ReadableStream
(async () => {
  const reader = stream.getReader();
  let result = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    console.log(value);
    result += new TextDecoder().decode(value);
  }
  console.log(result); // Outputs: "Hello, world!"
})();
