import type { JobListing } from "@job-researcher/shared";

const API_URL = "https://remotive.com/api/remote-jobs";
const CACHE_TTL = 24 * 60 * 60 * 1000;
const DESCRIPTION_LIMIT = 500;

type RemotiveJob = {
  id: number;
  title: string;
  company_name: string;
  url: string;
  description?: string;
  publication_date?: string;
  candidate_required_location?: string;
  job_type?: string;
  category?: string;
  tags?: string[];
};

type RemotiveResponse = { jobs: RemotiveJob[] };

let cache: { jobs: JobListing[]; expiresAt: number } | undefined;

function isJob(value: unknown): value is RemotiveJob {
  if (!value || typeof value !== "object") return false;
  const job = value as Partial<RemotiveJob>;
  if (
    typeof job.id !== "number" ||
    typeof job.title !== "string" ||
    typeof job.company_name !== "string" ||
    typeof job.url !== "string"
  ) {
    return false;
  }
  try {
    return new URL(job.url).protocol === "https:";
  } catch {
    return false;
  }
}

function toListing(job: RemotiveJob): JobListing {
  const description = (job.description || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const category = job.category?.trim() || null;
  const subcategories = job.tags?.filter((tag) => typeof tag === "string") ?? [];
  const publishedAt = job.publication_date ? Date.parse(job.publication_date) : Number.NaN;
  return {
    source: "Remotive",
    id: String(job.id),
    title: job.title,
    company: job.company_name.trim(),
    location: job.candidate_required_location?.trim() || "Location not specified",
    description:
      description.length > DESCRIPTION_LIMIT
        ? `${description.slice(0, DESCRIPTION_LIMIT).trimEnd()}…`
        : description,
    url: job.url,
    remote: true,
    tags: [...new Set([...subcategories, ...(category ? [category] : [])])],
    category,
    subcategories,
    type: job.job_type ? [job.job_type.replace(/_/g, " ")] : [],
    postedAt: Number.isFinite(publishedAt) ? Math.floor(publishedAt / 1000) : null,
  };
}

export async function getRemotiveListings(page: number) {
  if (page !== 1) return { jobs: [], hasMore: false };
  if (cache && cache.expiresAt > Date.now()) return cache;

  const response = await fetch(API_URL, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Remotive returned ${response.status}`);

  const data = (await response.json()) as RemotiveResponse;
  if (!Array.isArray(data.jobs)) throw new Error("Invalid response from Remotive");

  cache = {
    jobs: data.jobs.filter(isJob).map(toListing),
    expiresAt: Date.now() + CACHE_TTL,
  };
  return { jobs: cache.jobs, hasMore: false };
}
