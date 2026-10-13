import type { JobListing } from "@job-researcher/shared";

const API_URL = "https://www.arbeitnow.com/api/job-board-api";
const UK_API_URL = "https://www.arbeitnow.co.uk/api/job-board-api";
const CACHE_TTL = 10 * 60 * 1000;
const DESCRIPTION_LIMIT = 500;

type ArbeitnowJob = {
  slug: string;
  title: string;
  company_name: string;
  description: string;
  url: string;
  location?: string;
  remote?: boolean;
  tags?: unknown;
  job_types?: unknown;
  created_at?: number;
};

type ArbeitnowResponse = { data: ArbeitnowJob[]; links: { next: string | null } };

const cache = new Map<string, { expiresAt: number; jobs: JobListing[]; next: string | null }>();

function isJob(value: unknown): value is ArbeitnowJob {
  if (!value || typeof value !== "object") return false;

  const job = value as Partial<ArbeitnowJob>;
  if (
    typeof job.slug === "string" &&
    typeof job.title === "string" &&
    typeof job.company_name === "string" &&
    typeof job.url === "string" &&
    typeof job.description === "string"
  ) {
    try {
      return new URL(job.url).protocol === "https:";
    } catch {
      return false;
    }
  }
  return false;
}

function toListing(job: ArbeitnowJob, uk: boolean): JobListing {
  const description = job.description
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return {
    source: uk ? "Arbeitnow UK" : "Arbeitnow",
    id: job.slug,
    title: job.title,
    company: job.company_name,
    location: job.location?.trim() || (uk ? "United Kingdom" : "Location not specified"),
    description:
      description.length > DESCRIPTION_LIMIT
        ? `${description.slice(0, DESCRIPTION_LIMIT).trimEnd()}…`
        : description,
    url: job.url,
    remote: typeof job.remote === "boolean" ? job.remote : null,
    tags: Array.isArray(job.tags)
      ? job.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    category: null,
    subcategories: [],
    type: Array.isArray(job.job_types)
      ? job.job_types.filter((type): type is string => typeof type === "string")
      : [],
    postedAt: typeof job.created_at === "number" ? job.created_at : null,
  };
}

export async function getListings(page: number, uk = false) {
  const cacheKey = `${uk ? "uk" : "global"}:${page}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached;

  const response = await fetch(`${uk ? UK_API_URL : API_URL}?page=${page}`, {
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`Arbeitnow returned ${response.status}`);

  const data = (await response.json()) as ArbeitnowResponse;
  if (!Array.isArray(data.data) || !data.links) throw new Error("Invalid response from Arbeitnow");

  const result = {
    jobs: data.data.filter(isJob).map((job) => toListing(job, uk)),
    next: data.links.next,
    expiresAt: Date.now() + CACHE_TTL,
  };
  cache.set(cacheKey, result);
  return result;
}
