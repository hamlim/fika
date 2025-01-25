export default async function SavesRoute(_request: Request): Promise<Response> {
  return new Response("Hello, There!", {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
