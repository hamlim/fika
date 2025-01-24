import { doAction } from "./actions.js";

export function onClick() {
  console.log("hello world");
}

export function ClientComp({ action }) {
  return (
    <form action={action}>
      <button type="submit">Client Comp!</button>
    </form>
  );
}
