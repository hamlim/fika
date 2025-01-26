import type { MatchedRoute, Route, Router } from "./router";

// @TODO: This is a placeholder type.
type Context = Record<string, any>;

export type Store = {
  request: Request;
  context: Context;
  route: MatchedRoute;
  router: Router;
  routes: Array<[string, Route]>;
  importMap: {
    imports: Record<string, string>;
  };
  bootstrapModules: Array<string>;
};
