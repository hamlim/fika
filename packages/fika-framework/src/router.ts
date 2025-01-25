import type { ComponentType } from "react";

/**
 * @typedef {Object} Route
 * @property {string} rawPath
 * @property {'catch-all' | 'dynamic' | 'static'} routeType
 * @property {string[]} params
 * @property {string} filePath
 * @property {'rsc' | 'route'} type
 */

export type APIHandler = (
  requesst: Request,
  context: { params: MatchedRoute["matchedParams"] },
) => Promise<Response>;

export type Page = ComponentType<{ request: Request }>;

export type Route =
  | {
      rawPath: string;
      routeType: "catch-all" | "dynamic" | "static";
      params: string[];
      filePath: string;
      type: "page" | "api";
      $type: "custom" | "not-found" | "error";
      mod: () => Promise<{ default: APIHandler }>;
    }
  | {
      rawPath: string;
      routeType: "catch-all" | "dynamic" | "static";
      params: string[];
      filePath: string;
      type: "page";
      $type: "custom" | "not-found" | "error";
      mod: () => Promise<{ default: Page }>;
    };

// A generic router for the application
// Takes in a "manifest" of registered pages/routes
// and returns a router that supports route matching

export type MatchedRoute = Route & {
  // record if dynamic, array if catch-all
  matchedParams: Record<string, string | Array<string>>;
};

export type RouteManifest = Array<Route>;

export class Router {
  #manifest: RouteManifest;
  constructor(routeManifest: RouteManifest) {
    this.#manifest = routeManifest;
  }

  match(url: URL): MatchedRoute | undefined {
    let path = url.pathname;

    let pathChunks = path.split("/").filter(Boolean);

    for (let route of this.#manifest) {
      let routePathChunks = route.rawPath.split("/").filter(Boolean);
      if (route.routeType === "static") {
        if (route.rawPath === path) {
          return { ...route, matchedParams: {} };
        }
      }

      if (route.routeType === "dynamic" || route.routeType === "catch-all") {
        let routePathIdx = 0;
        let requestedPathIdx = 0;

        let matchedParams:
          | Record<string, string>
          | Record<string, Array<string>> = {};

        let matches = true;

        let overflowCount = 1000;

        while (
          routePathIdx < routePathChunks.length ||
          requestedPathIdx < pathChunks.length
        ) {
          if (overflowCount-- < 0) {
            throw new Error("Route matching overflow");
          }
          // static part of the route, increase indexes and continue
          if (routePathChunks[routePathIdx] === pathChunks[requestedPathIdx]) {
            routePathIdx++;
            requestedPathIdx++;
          } else if (routePathChunks[routePathIdx]?.startsWith("[...")) {
            // Nested Dynamic segment
            // If the requested path is present, add it to the matched params
            // and continue
            if (pathChunks[requestedPathIdx] !== undefined) {
              // remove the [... and ]
              let name = routePathChunks[routePathIdx].slice(4, -1);
              matchedParams[name] = pathChunks.slice(requestedPathIdx);
              // break - we don't check deeper than the nested dynamic segment
              break;
            }

            matches = false;
            // If the requested path is not present, break - this branch doesn't match!
            break;
          } else if (routePathChunks[routePathIdx]?.startsWith("[")) {
            // Single Dynamic segment
            // If the requested path is present, add it to the matched params
            // and continue
            if (pathChunks[requestedPathIdx] !== undefined) {
              matchedParams[routePathChunks[routePathIdx].slice(1, -1)] =
                pathChunks[requestedPathIdx];
              routePathIdx++;
              requestedPathIdx++;
            } else {
              // If the requested path is not present, break - this branch doesn't match!
              matches = false;
              break;
            }
          } else {
            // lengths didn't match and there wasn't a catch-all dynamic segment!
            matches = false;
            break;
          }
        }

        if (matches) {
          return {
            ...route,
            matchedParams,
          } /* as MatchedRoute*/;
        }
      }
    }
    return this.findNearestRoute(url, "not-found");
  }

  findNearestRoute(
    url: URL,
    routeType: Route["$type"],
  ): MatchedRoute | undefined {
    // Get all error routes
    let specificRoutes = this.#manifest.filter((r) => r.$type === routeType);
    if (!specificRoutes.length) {
      return undefined;
    }

    // Split the requested path into chunks
    let pathChunks = url.pathname.split("/").filter(Boolean);

    // Try to find the most specific error route by progressively removing path segments
    while (pathChunks.length > 0) {
      let currentPath = `/${pathChunks.join("/")}`;

      // Find an error route that matches the current path
      let matchingRoute = specificRoutes.find(
        (route) => route.rawPath === currentPath,
      );

      if (matchingRoute) {
        return {
          ...matchingRoute,
          matchedParams: {},
        } as MatchedRoute;
      }

      // Remove the last path segment and try again
      pathChunks.pop();
    }

    // If we haven't found a matching error route, return the root error route if it exists
    let rootRouteWithType = specificRoutes.find(
      (route) => route.rawPath === "/",
    );
    if (rootRouteWithType) {
      return {
        ...rootRouteWithType,
        matchedParams: {},
      } as MatchedRoute;
    }

    return undefined;
  }
}
