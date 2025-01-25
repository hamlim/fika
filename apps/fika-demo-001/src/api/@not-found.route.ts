export default async function NotFoundRoute(
  _request: Request,
): Promise<Response> {
  return new Response("Not Found", {
    status: 404,
  });
}
