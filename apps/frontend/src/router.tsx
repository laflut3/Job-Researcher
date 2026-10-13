import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { HomePage } from "./pages/home-page";

export type SearchState = {
  q: string;
  country: string;
  location: string;
  type: string;
  category: string;
  subcategory: string;
  remote: boolean;
  company: string;
  page: number;
};

const rootRoute = createRootRoute({ component: Outlet });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>): SearchState => ({
    q: typeof search.q === "string" ? search.q : "",
    country: typeof search.country === "string" ? search.country : "",
    location: typeof search.location === "string" ? search.location : "",
    type: typeof search.type === "string" ? search.type : "any",
    category: typeof search.category === "string" ? search.category : "",
    subcategory: typeof search.subcategory === "string" ? search.subcategory : "",
    remote: search.remote === true || search.remote === "true",
    company: typeof search.company === "string" ? search.company : "",
    page: typeof search.page === "number" && search.page > 0 ? Math.floor(search.page) : 1,
  }),
  component: HomePage,
});

const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
