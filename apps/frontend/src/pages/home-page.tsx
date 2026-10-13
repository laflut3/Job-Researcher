import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowDown, ArrowUpRight, Globe2, Search, Sparkles } from "lucide-react";
import type { JobListing, JobsResponse } from "@job-researcher/shared";
import { JobCard } from "../components/job-card";
import { SearchForm } from "../components/search-form";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import type { SearchState } from "../router";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isInternship(job: JobListing) {
  return /intern|praktikum|stage|alternance|apprent|werkstudent/.test(
    normalize([job.title, ...job.tags, ...job.type].join(" ")),
  );
}

function matchesType(job: JobListing, type: string) {
  const text = normalize([job.title, ...job.tags, ...job.type].join(" "));
  if (type === "internship") return isInternship(job);
  if (type === "apprenticeship") return /apprent|alternance|ausbildung/.test(text);
  if (type === "fixed") return /fixed.term|temporary|befristet|CDD/.test(text);
  if (type === "permanent") return /permanent|unbefristet|CDI/.test(text);
  return true;
}

function matches(job: JobListing, filters: SearchState) {
  const text = normalize(
    [job.title, job.company, job.description, job.location, ...job.tags, ...job.type].join(" "),
  );
  const terms = normalize(filters.q).trim().split(/\s+/).filter(Boolean);
  const queryMatches = terms.every((term) => text.includes(term));
  const locationMatches = normalize(job.location).includes(normalize(filters.location).trim());
  return (
    queryMatches &&
    locationMatches &&
    matchesType(job, filters.type) &&
    (!filters.remote || job.remote === true) &&
    (!filters.company || job.company === filters.company)
  );
}

export function HomePage() {
  const filters = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });
  const pageSize = 12;
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

  const jobs = jobsQuery.data?.pages.flatMap((page) => page.jobs) ?? [];
  const results = jobs.filter((job) => matches(job, filters));
  const companies = [
    ...new Set(
      jobs.filter((job) => matches(job, { ...filters, company: "" })).map((job) => job.company),
    ),
  ].sort((a, b) => a.localeCompare(b));
  const pageCount = Math.ceil(results.length / pageSize);
  const visibleResults = results.slice((filters.page - 1) * pageSize, filters.page * pageSize);
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
      (results.length > 0 || filters.page > 1) &&
      results.length < neededResults &&
      jobsQuery.hasNextPage &&
      !jobsQuery.isFetchingNextPage
    ) {
      void jobsQuery.fetchNextPage();
    }
  }, [filters.page, jobsQuery, pageSize, results.length]);

  function updateSearch(value: SearchState) {
    void navigate({ search: () => ({ ...value, page: 1 }), replace: false });
  }

  function goToPage(page: number) {
    void navigate({ search: (previous) => ({ ...previous, page }) });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[560px] bg-[radial-gradient(ellipse_at_top_right,_rgba(195,220,195,0.35),_transparent_55%)]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <header className="flex h-20 items-center justify-between border-b border-border/80">
          <a
            href="/"
            className="flex items-center gap-2.5 font-semibold tracking-tight text-foreground"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Globe2 className="size-5" />
            </span>
            <span>
              wayfinder<span className="text-primary">.</span>
            </span>
          </a>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <span className="size-2 rounded-full bg-emerald-500" /> Global job search, made simple
          </div>
          <a
            href="https://www.arbeitnow.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary"
          >
            About <ArrowUpRight className="size-4" />
          </a>
        </header>

        <section className="relative mx-auto max-w-5xl pb-12 pt-16 text-center sm:pb-14 sm:pt-24">
          <Badge className="mb-6 gap-1.5 border border-primary/10 bg-accent text-primary">
            <Sparkles className="size-3.5" /> Your next opportunity has no borders
          </Badge>
          <h1 className="mx-auto max-w-4xl font-serif text-5xl leading-[1.05] tracking-[-0.055em] text-foreground sm:text-7xl">
            Find work that takes you <span className="text-primary italic">further.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Search internships and early-career roles across borders. One search, direct links to
            the original listing.
          </p>
          <div className="mx-auto mt-9 max-w-5xl text-left">
            <SearchForm
              key={JSON.stringify(filters)}
              value={filters}
              companies={companies}
              onSearch={updateSearch}
            />
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span className="mr-1 self-center">Try:</span>
            {["Software", "Design", "Marketing", "Data"].map((term) => (
              <button
                key={term}
                onClick={() => updateSearch({ ...filters, q: term })}
                className="rounded-full border border-border bg-card px-3 py-1.5 transition hover:border-primary/30 hover:text-primary"
              >
                {term}
              </button>
            ))}
          </div>
        </section>

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
              Fresh listings from{" "}
              <a
                className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-primary"
                href="https://www.arbeitnow.com/"
                target="_blank"
                rel="noreferrer"
              >
                Arbeitnow
              </a>
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
          {jobsQuery.isError && (
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
          {!jobsQuery.isPending && !jobsQuery.isError && results.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent text-primary">
                <Search className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold">No matching roles on this page</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a broader keyword or clear one of your filters.
              </p>
              <Button
                variant="outline"
                className="mt-5"
                onClick={() =>
                  updateSearch({
                    q: "",
                    location: "",
                    type: "any",
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
              {visibleResults.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
          {jobsQuery.isFetchingNextPage && results.length < filters.page * pageSize && (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading this page…</p>
          )}
          {(pageCount > 1 || jobsQuery.hasNextPage) && !jobsQuery.isError && (
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
                  if (pageCount === 0 && jobsQuery.hasNextPage) {
                    void jobsQuery.fetchNextPage();
                  } else {
                    goToPage(filters.page + 1);
                  }
                }}
                disabled={filters.page >= pageCount && !jobsQuery.hasNextPage}
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

        <footer className="flex flex-col gap-2 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Wayfinder · Open-source job discovery</span>
          <span>
            Powered by the free public{" "}
            <a
              href="https://www.arbeitnow.com/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Arbeitnow API
            </a>
          </span>
        </footer>
      </div>
    </main>
  );
}
