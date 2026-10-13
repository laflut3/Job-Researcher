import { ArrowUpRight, BriefcaseBusiness, MapPin } from "lucide-react";
import { classifyJob, type JobListing } from "@job-researcher/shared";
import { Badge } from "./ui/badge";

function postedLabel(timestamp: number | null) {
  if (timestamp === null) return "Date unavailable";
  const days = Math.max(0, Math.floor((Date.now() / 1000 - timestamp) / 86_400));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export function JobCard({ job }: { job: JobListing }) {
  const category = classifyJob(job);
  return (
    <article className="group flex min-h-64 flex-col rounded-2xl border border-border bg-card p-6 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_16px_45px_-28px_rgba(24,48,39,0.35)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
          <BriefcaseBusiness className="size-5" />
        </div>
        <span className="pt-1 text-xs text-muted-foreground">{postedLabel(job.postedAt)}</span>
      </div>
      <div className="mt-5">
        <p className="text-sm font-medium text-muted-foreground">{job.company}</p>
        <h2 className="mt-1 text-xl font-semibold leading-snug tracking-[-0.03em] text-foreground">
          {job.title}
        </h2>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
        {job.description || "Open the original listing for more details."}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        <Badge className="gap-1.5 bg-background text-foreground">
          <MapPin className="size-3.5" />
          {job.location}
        </Badge>
        {job.remote === true && <Badge className="bg-accent text-primary">Remote</Badge>}
        {category.domains[0] !== "Other / Autre" && <Badge>{category.domains[0]}</Badge>}
        {category.subdomains[0] && <Badge>{category.subdomains[0]}</Badge>}
        {job.type.slice(0, 1).map((type) => (
          <Badge key={type}>{type}</Badge>
        ))}
        <a
          href={job.url}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-semibold text-primary outline-none transition hover:text-primary/70 focus-visible:ring-2 focus-visible:ring-ring"
        >
          View job <ArrowUpRight className="size-4" />
        </a>
      </div>
    </article>
  );
}
