export default async function GreetRoute(_request: Request): Promise<Response> {
  return new Response("Hello, World!", {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
