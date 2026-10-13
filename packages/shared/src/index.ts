export type HealthResponse = {
  status: "ok";
};

export type JobListing = {
  source: "Arbeitnow" | "Arbeitnow UK" | "Jobicy" | "Himalayas" | "Remotive";
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  remote: boolean | null;
  tags: string[];
  category: string | null;
  subcategories: string[];
  type: string[];
  postedAt: number | null;
};

export type JobsResponse = {
  jobs: JobListing[];
  sources: Array<JobListing["source"]>;
  page: number;
  hasMore: boolean;
};

export { classifyJob, resolveDomain, resolveSubdomain } from "./job-taxonomy.js";
