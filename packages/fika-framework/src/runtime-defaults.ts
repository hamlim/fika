export let importMapDefaults: Record<string, string> = {
  react: "https://esm.sh/react@experimental",
  "react/jsx-runtime": "https://esm.sh/react@experimental/jsx-runtime",
  "react-dom": "https://esm.sh/react-dom@experimental",
  "react-dom/client": "https://esm.sh/react-dom@experimental/client",
  // Special generated file during builds
  "#framework/storage": "/storage.client.js",
};

// Files are generated during builds by @fika-ts/tools
export let clientEntryBootstrapModules: Array<string> = [
  "/routes.gen.js",
  "/entry.client.js",
];
