export type HealthResponse = {
  status: "ok";
};

export type JobListing = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  remote: boolean | null;
  tags: string[];
  type: string[];
  postedAt: number | null;
};

export type JobsResponse = {
  jobs: JobListing[];
  source: "Arbeitnow";
  page: number;
  hasMore: boolean;
};
