import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { HomePage } from "./pages/home-page";
import i18n, { languageForLocale, locales } from "./i18n";

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

function validateSearch(search: Record<string, unknown>): SearchState {
  return {
    q: typeof search.q === "string" ? search.q : "",
    country: typeof search.country === "string" ? search.country : "",
    location: typeof search.location === "string" ? search.location : "",
    type: typeof search.type === "string" ? search.type : "any",
    category: typeof search.category === "string" ? search.category : "",
    subcategory: typeof search.subcategory === "string" ? search.subcategory : "",
    remote: search.remote === true || search.remote === "true",
    company: typeof search.company === "string" ? search.company : "",
    page: typeof search.page === "number" && search.page > 0 ? Math.floor(search.page) : 1,
  };
}

const rootRoute = createRootRoute({ component: Outlet });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch,
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/$locale",
      params: { locale: "en-us" },
      search,
      replace: true,
    });
  },
});

const localeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$locale",
  parseParams: ({ locale }) => ({ locale: locale.toLowerCase() }),
  validateSearch,
  beforeLoad: async ({ params, search }) => {
    if (!locales.includes(params.locale as (typeof locales)[number])) {
      throw redirect({
        to: "/$locale",
        params: { locale: "en-us" },
        search,
        replace: true,
      });
    }
    await i18n.changeLanguage(languageForLocale(params.locale));
  },
  component: HomePage,
});

const routeTree = rootRoute.addChildren([indexRoute, localeRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
