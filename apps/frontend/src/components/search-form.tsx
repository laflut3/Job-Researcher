import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal } from "lucide-react";
import type { SearchState } from "../router";
import { localizeFacet } from "../i18n";
import { resolveDomain, resolveSubdomain } from "@job-researcher/shared";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export function SearchForm({
  value,
  countries,
  locations,
  titles,
  categories,
  subcategoriesByDomain,
  companies,
  onSearch,
}: {
  value: SearchState;
  countries: Array<{ value: string; label: string }>;
  locations: string[];
  titles: string[];
  categories: string[];
  subcategoriesByDomain: Record<string, string[]>;
  companies: string[];
  onSearch: (value: SearchState) => void;
}) {
  const [form, setForm] = useState(value);
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage === "fr" ? "fr" : "en";
  const selectedDomain = resolveDomain(form.category);
  const subcategories = form.category ? (subcategoriesByDomain[selectedDomain] ?? []) : [];
  const subdomainEnabled = Boolean(selectedDomain && subcategories.length);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(form);
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-border bg-card p-3 shadow-[0_18px_55px_-38px_rgba(24,48,39,0.4)] sm:p-4"
    >
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-12">
        <label className="relative min-w-0 xl:col-span-4">
          <span className="sr-only">{t("titleSearch")}</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={form.q}
            onChange={(event) => setForm({ ...form, q: event.target.value })}
            placeholder={t("titlePlaceholder")}
            className="min-w-0 text-ellipsis pl-11"
            list="job-title-suggestions"
          />
          <datalist id="job-title-suggestions">
            {titles.map((title) => (
              <option key={title} value={title} />
            ))}
          </datalist>
        </label>
        <label className="min-w-0 xl:col-span-2">
          <span className="sr-only">{t("country")}</span>
          <Select
            value={
              countries.some(({ value }) => value === form.country) ? form.country : "any-country"
            }
            onValueChange={(country) =>
              setForm({ ...form, country: country === "any-country" ? "" : country, company: "" })
            }
          >
            <SelectTrigger aria-label={t("country")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any-country">{t("anyCountry")}</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="min-w-0 xl:col-span-2">
          <span className="sr-only">{t("location")}</span>
          <Select
            value={locations.includes(form.location) ? form.location : "any-location"}
            onValueChange={(location) =>
              setForm({
                ...form,
                location: location === "any-location" ? "" : location,
                company: "",
              })
            }
          >
            <SelectTrigger aria-label={t("location")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any-location">{t("anyLocation")}</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <Button type="submit" className="h-12 rounded-xl px-6 xl:col-span-4">
          <Search className="size-4" />
          {t("searchJobs")}
        </Button>
        <label className="min-w-0 xl:col-span-3">
          <span className="sr-only">{t("jobType")}</span>
          <Select value={form.type} onValueChange={(type) => setForm({ ...form, type })}>
            <SelectTrigger aria-label={t("jobType")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">{t("anyJobType")}</SelectItem>
              <SelectItem value="internship">{t("internships")}</SelectItem>
              <SelectItem value="apprenticeship">{t("apprenticeships")}</SelectItem>
              <SelectItem value="fixed">{t("fixedTerm")}</SelectItem>
              <SelectItem value="permanent">{t("permanent")}</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="min-w-0 xl:col-span-3">
          <span className="sr-only">{t("domain")}</span>
          <Input
            value={localizeFacet(form.category, language)}
            onChange={(event) =>
              setForm({ ...form, category: resolveDomain(event.target.value), subcategory: "" })
            }
            placeholder={t("anyDomain")}
            list="job-domain-suggestions"
            aria-label={t("domain")}
          />
          <datalist id="job-domain-suggestions">
            {categories.map((category) => (
              <option key={category} value={localizeFacet(category, language)} />
            ))}
          </datalist>
        </label>
        <label className="min-w-0 xl:col-span-3">
          <span className="sr-only">{t("subdomain")}</span>
          <Input
            value={localizeFacet(form.subcategory, language)}
            onChange={(event) =>
              setForm({ ...form, subcategory: resolveSubdomain(event.target.value) })
            }
            placeholder={subdomainEnabled ? t("anySubdomain") : t("chooseDomainFirst")}
            list={subdomainEnabled ? "job-subdomain-suggestions" : undefined}
            aria-label={t("subdomain")}
            disabled={!subdomainEnabled}
          />
          <datalist id="job-subdomain-suggestions">
            {subcategories.map((subcategory) => (
              <option key={subcategory} value={localizeFacet(subcategory, language)} />
            ))}
          </datalist>
        </label>
        <label className="min-w-0 xl:col-span-3">
          <span className="sr-only">{t("company")}</span>
          <Select
            value={companies.includes(form.company) ? form.company : "any"}
            onValueChange={(company) =>
              setForm({ ...form, company: company === "any" ? "" : company })
            }
          >
            <SelectTrigger aria-label={t("company")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">{t("anyCompany")}</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company} value={company}>
                  {company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>
      <p className="px-1 pt-2 text-xs text-muted-foreground">{t("companyHint")}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-1 pt-3">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-muted-foreground">
          <SlidersHorizontal className="size-3.5" />
          {t("quickFilters")}
        </span>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.remote}
            onChange={(event) => setForm({ ...form, remote: event.target.checked })}
            className="size-4 accent-primary"
          />
          {t("remoteOnly")}
        </label>
        <button
          type="button"
          onClick={() => {
            const reset = {
              q: "",
              country: "",
              location: "",
              type: "any",
              category: "",
              subcategory: "",
              remote: false,
              company: "",
              page: 1,
            };
            setForm(reset);
            onSearch(reset);
          }}
          className="ml-auto text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {t("clearFilters")}
        </button>
      </div>
    </form>
  );
}
