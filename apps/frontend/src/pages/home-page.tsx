import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, BriefcaseBusiness, Search } from "lucide-react";
import type { JobListing, JobsResponse } from "@job-researcher/shared";
import { classifyJob, resolveDomain, resolveSubdomain } from "@job-researcher/shared";
import { JobCard } from "../components/job-card";
import { SearchForm } from "../components/search-form";
import { Button } from "../components/ui/button";
import type { SearchState } from "../router";
import { canonicalCountry, countryCode, countryOptions } from "../lib/countries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

type Theme = "system" | "light" | "dark";
const AUTO_SCAN_PAGE_LIMIT = 3;
function storedTheme(): Theme {
  const theme = localStorage.getItem("fleo-jobs-theme");
  return theme === "light" || theme === "dark" ? theme : "system";
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isInternship(job: JobListing) {
  return /\b(?:intern(?:ship)?s?|praktikum|stage|alternance|apprenticeship|apprentice|werkstudent)\b/.test(
    normalize([job.title, ...job.tags, ...job.type].join(" ")),
  );
}

function countryFromValue(value: string) {
  return canonicalCountry(value);
}

const regionCountries: Record<string, Set<string>> = {
  europe: new Set(
    "AD AL AM AT AZ BA BE BG BY CH CY CZ DE DK EE ES FI FR GB GE GR HR HU IE IS IT LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SK SM TR UA VA XK".split(
      " ",
    ),
  ),
  apac: new Set(
    "AF AS AU BD BN BT CN FJ FM GU HK ID IN JP KG KH KI KP KR KZ LA LK MH MM MN MO MP MV MY NC NF NP NR NU NZ PF PG PH PK PW SB SG TH TJ TK TL TM TO TV TW UZ VN VU WF WS".split(
      " ",
    ),
  ),
  latam: new Set(
    "AR BO BR BZ CL CO CR CU DO EC GT GY HN HT JM MX NI PA PE PY SR SV UY VE".split(" "),
  ),
};

function isAvailableInCountry(location: string, country: string) {
  const code = countryCode(country);
  return location.split(",").some((part) => {
    const area = part.trim();
    const region = normalize(area);
    if (canonicalCountry(area) === country) return true;
    if (region === "anywhere" || region === "worldwide" || region === "global") return true;
    if (region === "emea")
      return (
        regionCountries.europe!.has(code) ||
        "DZ EG EH ER ET LY MA SD SS TN".split(" ").includes(code)
      );
    return regionCountries[region]?.has(code) ?? false;
  });
}

function matchesType(job: JobListing, type: string) {
  const text = normalize([job.title, ...job.tags, ...job.type].join(" "));
  if (type === "internship") return isInternship(job);
  if (type === "apprenticeship") return /apprent|alternance|ausbildung/.test(text);
  if (type === "fixed") return /fixed.term|temporary|befristet|cdd/.test(text);
  if (type === "permanent") return /permanent|unbefristet|cdi/.test(text);
  return true;
}

type ClassifiedJob = { job: JobListing; domains: string[]; subdomains: string[] };

function matches({ job, domains, subdomains }: ClassifiedJob, filters: SearchState) {
  const text = normalize(
    [job.title, job.company, job.description, job.location, ...job.tags, ...job.type].join(" "),
  );
  const terms = normalize(filters.q).trim().split(/\s+/).filter(Boolean);
  const queryMatches = terms.every((term) => text.includes(term));
  const locationMatches = normalize(job.location).includes(normalize(filters.location).trim());
  const selectedCountry = countryFromValue(filters.country);
  const countryMatches =
    !filters.country ||
    Boolean(selectedCountry && isAvailableInCountry(job.location, selectedCountry));
  return (
    queryMatches &&
    locationMatches &&
    countryMatches &&
    (!filters.category ||
      domains.some((domain) =>
        normalize(domain).includes(normalize(resolveDomain(filters.category))),
      )) &&
    (!filters.subcategory ||
      subdomains.some((subdomain) =>
        normalize(subdomain).includes(normalize(resolveSubdomain(filters.subcategory))),
      )) &&
    matchesType(job, filters.type) &&
    (!filters.remote || job.remote === true) &&
    (!filters.company || job.company === filters.company)
  );
}

export function HomePage() {
  const filters = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });
  const [theme, setTheme] = useState<Theme>(storedTheme);
  const pageSize = 12;

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    if (theme !== "system") document.documentElement.classList.add(theme);
    localStorage.setItem("fleo-jobs-theme", theme);
  }, [theme]);
  const jobsQuery = useInfiniteQuery({
    queryKey: ["jobs"],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await fetch(`/api/jobs?page=${pageParam}`);
      if (!response.ok) throw new Error("Job listings are temporarily unavailable.");
      return (await response.json()) as JobsResponse;
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    staleTime: 10 * 60 * 1000,
  });

  const loadedPages = jobsQuery.data?.pages.length ?? 0;
  const jobs = [
    ...new Map(
      (jobsQuery.data?.pages.flatMap((page) => page.jobs) ?? []).map((job) => [job.url, job]),
    ).values(),
  ];
  const classifiedJobs = jobs.map((job) => ({ job, ...classifyJob(job) }));
  const results = classifiedJobs.filter((job) => matches(job, filters));
  const hasActiveFilters =
    Boolean(
      filters.q ||
      filters.country ||
      filters.location ||
      filters.company ||
      filters.category ||
      filters.subcategory,
    ) ||
    filters.type !== "any" ||
    filters.remote;
  const locations = [...new Set(jobs.map((job) => job.location).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
  const titles = [...new Set(jobs.map((job) => job.title).filter(Boolean))].slice(0, 150);
  const categories = [...new Set(classifiedJobs.flatMap((job) => job.domains))].sort((a, b) =>
    a.localeCompare(b),
  );
  const selectedDomain = resolveDomain(filters.category);
  const subcategories = [
    ...new Set(
      classifiedJobs
        .filter((job) => !filters.category || job.domains.includes(selectedDomain))
        .flatMap((job) => job.subdomains),
    ),
  ].sort((a, b) => a.localeCompare(b));
  const companies = [
    ...new Set(
      classifiedJobs
        .filter((job) => matches(job, { ...filters, company: "" }))
        .map(({ job }) => job.company),
    ),
  ].sort((a, b) => a.localeCompare(b));
  const pageCount = Math.ceil(results.length / pageSize);
  const visibleResults = results.slice((filters.page - 1) * pageSize, filters.page * pageSize);
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = jobsQuery;
  const visiblePages = [
    ...new Set(
      [
        1,
        ...Array.from(
          {
            length: Math.max(
              0,
              Math.min(pageCount, filters.page + 1) - Math.max(1, filters.page - 1) + 1,
            ),
          },
          (_, index) => Math.max(1, filters.page - 1) + index,
        ),
        pageCount,
      ].filter((page) => page > 0 && page <= pageCount),
    ),
  ];

  useEffect(() => {
    const neededResults = filters.page * pageSize;
    if (
      (results.length > 0 || filters.page > 1 || hasActiveFilters) &&
      results.length < neededResults &&
      hasNextPage &&
      !isFetchingNextPage &&
      loadedPages < AUTO_SCAN_PAGE_LIMIT
    ) {
      void fetchNextPage();
    }
  }, [
    filters.page,
    hasActiveFilters,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    loadedPages,
    pageSize,
    results.length,
  ]);

  function updateSearch(value: SearchState) {
    void navigate({ search: () => ({ ...value, page: 1 }), replace: false });
  }

  function goToPage(page: number) {
    void navigate({ search: (previous) => ({ ...previous, page }) });
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[560px] bg-[radial-gradient(ellipse_at_top_right,_rgba(195,220,195,0.35),_transparent_55%)]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <header className="flex h-20 items-center justify-between border-b border-border/80">
          <a
            href="/"
            className="flex items-center gap-2.5 font-semibold tracking-tight text-foreground"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BriefcaseBusiness className="size-5" />
            </span>
            <span>fleo-jobs</span>
          </a>
          <label className="sr-only" htmlFor="theme-select">
            Color theme
          </label>
          <Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
            <SelectTrigger id="theme-select" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </header>

        <section className="relative mx-auto max-w-5xl pb-12 pt-16 text-center sm:pb-14 sm:pt-24">
          <h1 className="mx-auto max-w-4xl font-serif text-5xl leading-[1.05] tracking-[-0.055em] text-foreground sm:text-7xl">
            Find your next opportunity <span className="text-primary italic">worldwide.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Search global remote and European listings. Apply directly with the original source.
          </p>
        </section>

        <div className="sticky top-0 z-30 -mx-5 border-y border-border/70 bg-background/90 px-5 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <SearchForm
              key={JSON.stringify(filters)}
              value={filters}
              countries={countryOptions}
              locations={locations}
              titles={titles}
              categories={categories}
              subcategories={subcategories}
              companies={companies}
              onSearch={updateSearch}
            />
          </div>
        </div>

        <section className="pb-24" aria-live="polite">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Opportunities
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                {jobsQuery.isPending
                  ? "Finding your next move…"
                  : `${results.length} roles to explore`}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Listings from{" "}
              {jobsQuery.data?.pages[0]?.sources.map((source, index, sources) => (
                <span key={source}>
                  {index > 0 && (index === sources.length - 1 ? " and " : ", ")}
                  <a
                    className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-primary"
                    href={
                      source === "Arbeitnow" || source === "Arbeitnow UK"
                        ? "https://www.arbeitnow.com/"
                        : source === "Himalayas"
                          ? "https://himalayas.app/"
                          : source === "Remotive"
                            ? "https://remotive.com/"
                            : "https://jobicy.com/"
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    {source}
                  </a>
                </span>
              ))}
            </p>
          </div>

          {jobsQuery.isPending && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className="h-64 animate-pulse rounded-2xl border border-border bg-card"
                />
              ))}
            </div>
          )}
          {jobsQuery.isError && !jobsQuery.data && (
            <div className="rounded-2xl border border-destructive/20 bg-card p-8 text-center">
              <h3 className="font-semibold">We couldn’t load the listings</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                The free job feed may be temporarily unavailable. Please try again.
              </p>
              <Button variant="outline" className="mt-5" onClick={() => void jobsQuery.refetch()}>
                Try again
              </Button>
            </div>
          )}
          {!jobsQuery.isPending &&
            !jobsQuery.isFetchingNextPage &&
            (!jobsQuery.isError || jobsQuery.data) &&
            results.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent text-primary">
                  <Search className="size-5" />
                </div>
                <h3 className="mt-4 font-semibold">No matching roles in the loaded listings</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try a broader keyword, clear a filter, or load more listings.
                </p>
                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={() =>
                    updateSearch({
                      q: "",
                      country: "",
                      location: "",
                      type: "any",
                      category: "",
                      subcategory: "",
                      remote: false,
                      company: "",
                      page: 1,
                    })
                  }
                >
                  Clear filters
                </Button>
              </div>
            )}
          {visibleResults.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visibleResults.map(({ job }) => (
                <JobCard key={`${job.source}:${job.id}`} job={job} />
              ))}
            </div>
          )}
          {jobsQuery.isFetchingNextPage && results.length < filters.page * pageSize && (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading this page…</p>
          )}
          {jobsQuery.isError && jobsQuery.data && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
              Could not load more listings.
              <Button variant="outline" size="sm" onClick={() => void jobsQuery.fetchNextPage()}>
                Retry
              </Button>
            </div>
          )}
          {jobsQuery.hasNextPage && !jobsQuery.isError && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                onClick={() => void jobsQuery.fetchNextPage()}
                disabled={jobsQuery.isFetchingNextPage}
              >
                {jobsQuery.isFetchingNextPage ? "Loading listings…" : "Load more listings"}
              </Button>
            </div>
          )}
          {pageCount > 1 && (
            <nav
              aria-label="Job results pages"
              className="mt-9 flex flex-wrap items-center justify-center gap-2"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(filters.page - 1)}
                disabled={filters.page <= 1}
              >
                Previous
              </Button>
              {visiblePages.map((page, index) => (
                <span key={page} className="contents">
                  {index > 0 && page - visiblePages[index - 1]! > 1 && (
                    <span className="px-1 text-muted-foreground">…</span>
                  )}
                  <Button
                    size="sm"
                    variant={page === filters.page ? "default" : "ghost"}
                    aria-current={page === filters.page ? "page" : undefined}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                </span>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  goToPage(filters.page + 1);
                }}
                disabled={filters.page >= pageCount}
              >
                {jobsQuery.isFetchingNextPage ? (
                  "Loading…"
                ) : (
                  <>
                    Next <ArrowDown className="size-3.5 -rotate-90" />
                  </>
                )}
              </Button>
            </nav>
          )}
          <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">
            Listings are provided by third-party sources. Always check the original posting for
            current details and eligibility.
          </p>
        </section>

        <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
          fleo-jobs · Open-source job discovery
        </footer>
      </div>
    </main>
  );
}
