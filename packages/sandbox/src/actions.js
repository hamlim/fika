import { registerServerReference } from "../dist/bundle.js";

export async function doAction() {
  console.log("hello world");
}
registerServerReference(doAction, "./actions.js", "doAction");
