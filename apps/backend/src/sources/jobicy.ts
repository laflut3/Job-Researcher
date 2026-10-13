import type { JobListing } from "@job-researcher/shared";

const API_URL = "https://jobicy.com/api/v2/remote-jobs";
const CACHE_TTL = 10 * 60 * 1000;
const DESCRIPTION_LIMIT = 500;

type JobicyJob = {
  id: number;
  url: string;
  jobTitle: string;
  companyName: string;
  jobGeo?: string;
  jobType?: string[];
  jobIndustry?: string[];
  jobExcerpt?: string;
  jobDescription?: string;
  pubDate?: string;
};

type JobicyResponse = {
  jobs: JobicyJob[];
  nextCursor?: string | null;
};

type ListingsPage = { jobs: JobListing[]; hasMore: boolean; expiresAt: number };

const cache = new Map<number, ListingsPage>();
const cursors = new Map<number, string>();

function isJob(value: unknown): value is JobicyJob {
  if (!value || typeof value !== "object") return false;
  const job = value as Partial<JobicyJob>;
  if (
    typeof job.id !== "number" ||
    typeof job.url !== "string" ||
    typeof job.jobTitle !== "string" ||
    typeof job.companyName !== "string"
  ) {
    return false;
  }
  try {
    return new URL(job.url).protocol === "https:";
  } catch {
    return false;
  }
}

function toListing(job: JobicyJob): JobListing {
  const description = (job.jobExcerpt || job.jobDescription || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&hellip;/gi, "…")
    .replace(/&amp;/gi, "&")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return {
    source: "Jobicy",
    id: String(job.id),
    title: job.jobTitle,
    company: job.companyName,
    location: job.jobGeo?.trim() || "Location not specified",
    description:
      description.length > DESCRIPTION_LIMIT
        ? `${description.slice(0, DESCRIPTION_LIMIT).trimEnd()}…`
        : description,
    url: job.url,
    remote: true,
    tags: Array.isArray(job.jobIndustry)
      ? job.jobIndustry.filter((value): value is string => typeof value === "string")
      : [],
    category: Array.isArray(job.jobIndustry)
      ? (job.jobIndustry.find((value): value is string => typeof value === "string") ?? null)
      : null,
    subcategories: Array.isArray(job.jobIndustry)
      ? job.jobIndustry.filter((value): value is string => typeof value === "string").slice(1)
      : [],
    type: Array.isArray(job.jobType)
      ? job.jobType.filter((value): value is string => typeof value === "string")
      : [],
    postedAt:
      job.pubDate && Number.isFinite(Date.parse(job.pubDate))
        ? Math.floor(Date.parse(job.pubDate) / 1000)
        : null,
  };
}

export async function getJobicyListings(page: number) {
  const cached = cache.get(page);
  if (cached && cached.expiresAt > Date.now()) return cached;

  const cursor = page === 1 ? undefined : cursors.get(page);
  if (page > 1 && !cursor) return { jobs: [], hasMore: false };

  const url = new URL(API_URL);
  url.searchParams.set("count", "200");
  if (cursor) url.searchParams.set("cursor", cursor);

  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Jobicy returned ${response.status}`);

  const data = (await response.json()) as JobicyResponse;
  if (!Array.isArray(data.jobs)) throw new Error("Invalid response from Jobicy");

  const result = {
    jobs: data.jobs.filter(isJob).map(toListing),
    hasMore: typeof data.nextCursor === "string" && data.nextCursor.length > 0,
    expiresAt: Date.now() + CACHE_TTL,
  };
  if (result.hasMore) cursors.set(page + 1, data.nextCursor!);
  cache.set(page, result);
  return result;
}
