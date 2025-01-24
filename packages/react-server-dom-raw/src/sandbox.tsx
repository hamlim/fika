import { renderToReadableStream } from "./server.js";

let stream = renderToReadableStream(
  <div>Hello, world!</div>,
  "http://localhost:3000",
  {},
);

console.log(stream);
