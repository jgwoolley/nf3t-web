import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute";

export const Nf3tCliRoute = createRoute({
    path: "/nf3tcli",
    getParentRoute: () => routeTree,
}).lazy(() => import('./nf3tcli.lazy').then((d) => d.Route));