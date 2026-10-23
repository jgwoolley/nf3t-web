import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";

export const AvailabilityRoute = createRoute({
    path: "/availability",
    getParentRoute: () => routeTree,
}).lazy(() => import('./AvailabilityRoute.lazy.tsx').then((d) => d.Route));
