import { getStore } from "#framework/storage";

export default function IndexPage() {
  let store = getStore();

  console.log(Object.keys(store));

  return (
    <html lang="en" className="h-full">
      <head>
        <title>Hello World</title>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        {/* biome-ignore lint/a11y/noDistractingElements: <explanation> */}
        <marquee className="text-4xl">Hello World</marquee>
      </body>
    </html>
  );
}
