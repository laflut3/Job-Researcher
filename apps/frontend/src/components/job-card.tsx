import { ArrowUpRight, BriefcaseBusiness, MapPin } from "lucide-react";
import { classifyJob, type JobListing } from "@job-researcher/shared";
import { useTranslation } from "react-i18next";
import { localizeFacet } from "../i18n";
import { Badge } from "./ui/badge";

function postedLabel(
  timestamp: number | null,
  t: (key: string, options?: { count: number }) => string,
) {
  if (timestamp === null) return t("dateUnavailable");
  const days = Math.max(0, Math.floor((Date.now() / 1000 - timestamp) / 86_400));
  if (days === 0) return t("today");
  if (days === 1) return t("yesterday");
  return t("daysAgo", { count: days });
}

export function JobCard({ job }: { job: JobListing }) {
  const category = classifyJob(job);
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage === "fr" ? "fr" : "en";
  return (
    <article className="group flex min-h-64 flex-col rounded-2xl border border-border bg-card p-6 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_16px_45px_-28px_rgba(24,48,39,0.35)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
          <BriefcaseBusiness className="size-5" />
        </div>
        <span className="pt-1 text-xs text-muted-foreground">{postedLabel(job.postedAt, t)}</span>
      </div>
      <div className="mt-5">
        <p className="text-sm font-medium text-muted-foreground">{job.company}</p>
        <h2 className="mt-1 text-xl font-semibold leading-snug tracking-[-0.03em] text-foreground">
          {job.title}
        </h2>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
        {job.description || t("originalListing")}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        <Badge className="gap-1.5 bg-background text-foreground">
          <MapPin className="size-3.5" />
          {job.location}
        </Badge>
        {job.remote === true && <Badge className="bg-accent text-primary">{t("remote")}</Badge>}
        {category.domains[0] !== "Other / Autre" && (
          <Badge>{localizeFacet(category.domains[0]!, language)}</Badge>
        )}
        {category.subdomains[0] && <Badge>{localizeFacet(category.subdomains[0], language)}</Badge>}
        {job.type.slice(0, 1).map((type) => (
          <Badge key={type}>{type}</Badge>
        ))}
        <a
          href={job.url}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-semibold text-primary outline-none transition hover:text-primary/70 focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t("viewJob")} <ArrowUpRight className="size-4" />
        </a>
      </div>
    </article>
  );
}
