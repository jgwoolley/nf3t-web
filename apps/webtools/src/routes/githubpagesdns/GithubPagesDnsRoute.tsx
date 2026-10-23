import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";

export const GithubPagesDnsRoute = createRoute({
    path: "/githubpagesdns",
    getParentRoute: () => routeTree,
}).lazy(() => import('./GithubPagesDnsRoute.lazy.tsx').then((d) => d.Route));
