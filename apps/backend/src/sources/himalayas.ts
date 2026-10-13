import type { JobListing } from "@job-researcher/shared";

const API_URL = "https://himalayas.app/jobs/api";
const CACHE_TTL = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 20;
const DESCRIPTION_LIMIT = 500;

type HimalayasJob = {
  guid: string;
  title: string;
  companyName: string;
  applicationLink: string;
  excerpt?: string;
  description?: string;
  locationRestrictions?: string[];
  employmentType?: string;
  parentCategories?: string[];
  categories?: string[];
  pubDate?: number;
};

type HimalayasResponse = { jobs: HimalayasJob[]; totalCount: number };

const cache = new Map<number, { jobs: JobListing[]; hasMore: boolean; expiresAt: number }>();
let lastRequestAt = 0;

function cleanDescription(value: string) {
  const description = value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return description.length > DESCRIPTION_LIMIT
    ? `${description.slice(0, DESCRIPTION_LIMIT).trimEnd()}…`
    : description;
}

function isJob(value: unknown): value is HimalayasJob {
  if (!value || typeof value !== "object") return false;
  const job = value as Partial<HimalayasJob>;
  return (
    typeof job.guid === "string" &&
    typeof job.title === "string" &&
    typeof job.companyName === "string" &&
    typeof job.applicationLink === "string" &&
    isHttpsUrl(job.applicationLink)
  );
}

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function toListing(job: HimalayasJob): JobListing {
  const category = job.parentCategories?.find((value) => typeof value === "string") ?? null;
  const subcategories = job.categories?.filter((value) => typeof value === "string") ?? [];
  return {
    source: "Himalayas",
    id: job.guid,
    title: job.title,
    company: job.companyName,
    location: job.locationRestrictions?.filter(Boolean).join(", ") || "Location not specified",
    description: cleanDescription(job.excerpt || job.description || ""),
    url: job.applicationLink,
    remote: true,
    tags: [...new Set([...subcategories, ...(category ? [category] : [])])],
    category,
    subcategories,
    type: job.employmentType ? [job.employmentType] : [],
    postedAt: typeof job.pubDate === "number" ? job.pubDate : null,
  };
}

export async function getHimalayasListings(page: number) {
  const cached = cache.get(page);
  if (cached && cached.expiresAt > Date.now()) return cached;

  const wait = Math.max(0, 1_000 - (Date.now() - lastRequestAt));
  if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
  lastRequestAt = Date.now();

  const url = new URL(API_URL);
  url.searchParams.set("limit", String(PAGE_SIZE));
  url.searchParams.set("offset", String((page - 1) * PAGE_SIZE));
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Himalayas returned ${response.status}`);

  const data = (await response.json()) as HimalayasResponse;
  if (!Array.isArray(data.jobs) || typeof data.totalCount !== "number") {
    throw new Error("Invalid response from Himalayas");
  }

  const result = {
    jobs: data.jobs.filter(isJob).map(toListing),
    hasMore: page * PAGE_SIZE < data.totalCount,
    expiresAt: Date.now() + CACHE_TTL,
  };
  cache.set(page, result);
  return result;
}
