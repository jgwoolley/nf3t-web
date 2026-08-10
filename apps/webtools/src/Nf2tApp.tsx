'use client';

import {
  RouterProvider,
  createHashHistory,
  createRouter,
} from '@tanstack/react-router';
import rootRoute from './routes/rootRoute';
import { routeChildren } from './routes/routeDescriptions';
import { notFoundRoute } from './routes/notFoundRoute';

const routeTree = rootRoute.addChildren(routeChildren);

const history = createHashHistory();

const router = createRouter({
  history: history,
  routeTree: routeTree,
  notFoundRoute: notFoundRoute,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function Nf2tApp() {
  return <RouterProvider router={router} />;
}
