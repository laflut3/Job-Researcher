import { useState, type FormEvent } from "react";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import type { SearchState } from "../router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export function SearchForm({
  value,
  companies,
  onSearch,
}: {
  value: SearchState;
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
      <div className="grid gap-2 md:grid-cols-[1fr_0.8fr_0.72fr_0.8fr_auto]">
        <label className="relative">
          <span className="sr-only">Job title or keyword</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={form.q}
            onChange={(event) => setForm({ ...form, q: event.target.value })}
            placeholder="Role, skill or keyword"
            className="pl-11"
          />
        </label>
        <label className="relative">
          <span className="sr-only">Location</span>
          <MapPin className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={form.location}
            onChange={(event) => setForm({ ...form, location: event.target.value, company: "" })}
            placeholder="Country or city"
            className="pl-11"
          />
        </label>
        <label>
          <span className="sr-only">Job type</span>
          <Select value={form.type} onValueChange={(type) => setForm({ ...form, type })}>
            <SelectTrigger>
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
        <label>
          <span className="sr-only">Company</span>
          <Select
            value={companies.includes(form.company) ? form.company : "any"}
            onValueChange={(company) =>
              setForm({ ...form, company: company === "any" ? "" : company })
            }
          >
            <SelectTrigger>
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
        <Button type="submit" className="h-12 rounded-xl px-6">
          <Search className="size-4" />
          Search jobs
        </Button>
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
            const reset = { q: "", location: "", type: "any", remote: false, company: "", page: 1 };
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
