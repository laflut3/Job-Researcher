import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import type { HealthResponse } from "@job-researcher/shared";
import { HomePage } from "./pages/home-page";

const rootRoute = createRootRoute({ component: Outlet });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  loader: async (): Promise<HealthResponse> => {
    const response = await fetch("/api/health");

    if (!response.ok) {
      throw new Error("The API is unavailable");
    }

    return response.json();
  },
  component: HomePage,
});

const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
