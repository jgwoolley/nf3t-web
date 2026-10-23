import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";

export const AiStanceRoute = createRoute({
    path: "/aistance",
    getParentRoute: () => routeTree,
}).lazy(() => import('./AiStanceRoute.lazy.tsx').then((d) => d.Route));
