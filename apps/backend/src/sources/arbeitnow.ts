import type { JobListing } from "@job-researcher/shared";

const API_URL = "https://www.arbeitnow.com/api/job-board-api";
const CACHE_TTL = 10 * 60 * 1000;

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

const cache = new Map<number, { expiresAt: number; jobs: JobListing[]; next: string | null }>();

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

function toListing(job: ArbeitnowJob): JobListing {
  return {
    id: job.slug,
    title: job.title,
    company: job.company_name,
    location: job.location?.trim() || "Location not specified",
    description: job.description
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
    url: job.url,
    remote: typeof job.remote === "boolean" ? job.remote : null,
    tags: Array.isArray(job.tags)
      ? job.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    type: Array.isArray(job.job_types)
      ? job.job_types.filter((type): type is string => typeof type === "string")
      : [],
    postedAt: typeof job.created_at === "number" ? job.created_at : null,
  };
}

export async function getListings(page: number) {
  const cached = cache.get(page);
  if (cached && cached.expiresAt > Date.now()) return cached;

  const response = await fetch(`${API_URL}?page=${page}`, {
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`Arbeitnow returned ${response.status}`);

  const data = (await response.json()) as ArbeitnowResponse;
  if (!Array.isArray(data.data) || !data.links) throw new Error("Invalid response from Arbeitnow");

  const result = {
    jobs: data.data.filter(isJob).map(toListing),
    next: data.links.next,
    expiresAt: Date.now() + CACHE_TTL,
  };
  cache.set(page, result);
  return result;
}
