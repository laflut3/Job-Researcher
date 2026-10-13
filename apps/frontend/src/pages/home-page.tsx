import { useLoaderData } from "@tanstack/react-router";

export function HomePage() {
  const health = useLoaderData({ from: "/" });

  return (
    <main className="mx-auto mt-24 max-w-3xl px-6">
      <h1 className="mb-2 text-3xl font-bold">Job Researcher</h1>
      <p>Search for jobs, internships, and apprenticeships around the world.</p>
      <p className="mt-4 text-sm text-slate-500">API status: {health.status}</p>
    </main>
  );
}
