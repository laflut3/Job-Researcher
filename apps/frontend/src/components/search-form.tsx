import { useState, type FormEvent } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { SearchState } from "../router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export function SearchForm({
  value,
  countries,
  locations,
  titles,
  categories,
  subcategories,
  companies,
  onSearch,
}: {
  value: SearchState;
  countries: string[];
  locations: string[];
  titles: string[];
  categories: string[];
  subcategories: string[];
  companies: string[];
  onSearch: (value: SearchState) => void;
}) {
  const [form, setForm] = useState(value);

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
          <span className="sr-only">Job title or keyword</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={form.q}
            onChange={(event) => setForm({ ...form, q: event.target.value })}
            placeholder="Role, skill or keyword"
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
          <span className="sr-only">Country</span>
          <Select
            value={countries.includes(form.country) ? form.country : "any-country"}
            onValueChange={(country) =>
              setForm({ ...form, country: country === "any-country" ? "" : country, company: "" })
            }
          >
            <SelectTrigger aria-label="Country">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any-country">Any country</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="min-w-0 xl:col-span-2">
          <span className="sr-only">City or location</span>
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
            <SelectTrigger aria-label="City or location">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any-location">Any city or location</SelectItem>
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
          Search jobs
        </Button>
        <label className="min-w-0 xl:col-span-3">
          <span className="sr-only">Job type</span>
          <Select value={form.type} onValueChange={(type) => setForm({ ...form, type })}>
            <SelectTrigger aria-label="Job type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any job type</SelectItem>
              <SelectItem value="internship">Internships</SelectItem>
              <SelectItem value="apprenticeship">Apprenticeships</SelectItem>
              <SelectItem value="fixed">Fixed-term</SelectItem>
              <SelectItem value="permanent">Permanent</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="min-w-0 xl:col-span-3">
          <span className="sr-only">Domain / Domaine</span>
          <Input
            value={form.category}
            onChange={(event) =>
              setForm({ ...form, category: event.target.value, subcategory: "" })
            }
            placeholder="Any domain / Domaine"
            list="job-domain-suggestions"
            aria-label="Domain / Domaine"
          />
          <datalist id="job-domain-suggestions">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </label>
        <label className="min-w-0 xl:col-span-3">
          <span className="sr-only">Subdomain / Sous-domaine</span>
          <Input
            value={form.subcategory}
            onChange={(event) => setForm({ ...form, subcategory: event.target.value })}
            placeholder="Any subdomain / Sous-domaine"
            list="job-subdomain-suggestions"
            aria-label="Subdomain / Sous-domaine"
          />
          <datalist id="job-subdomain-suggestions">
            {subcategories.map((subcategory) => (
              <option key={subcategory} value={subcategory} />
            ))}
          </datalist>
        </label>
        <label className="min-w-0 xl:col-span-3">
          <span className="sr-only">Company</span>
          <Select
            value={companies.includes(form.company) ? form.company : "any"}
            onValueChange={(company) =>
              setForm({ ...form, company: company === "any" ? "" : company })
            }
          >
            <SelectTrigger aria-label="Company">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any company</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company} value={company}>
                  {company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>
      <p className="px-1 pt-2 text-xs text-muted-foreground">
        Companies update from available listings after you choose a country or location.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-1 pt-3">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-muted-foreground">
          <SlidersHorizontal className="size-3.5" />
          Quick filters
        </span>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.remote}
            onChange={(event) => setForm({ ...form, remote: event.target.checked })}
            className="size-4 accent-primary"
          />
          Remote only
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
          Clear filters
        </button>
      </div>
    </form>
  );
}
