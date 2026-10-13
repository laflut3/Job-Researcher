import type { FastifyInstance } from "fastify";
import { getListings } from "../sources/arbeitnow.js";
import { getJobicyListings } from "../sources/jobicy.js";
import { getHimalayasListings } from "../sources/himalayas.js";
import { getRemotiveListings } from "../sources/remotive.js";

export async function registerJobsRoutes(app: FastifyInstance) {
  app.get(
    "/api/jobs",
    {
      schema: {
        querystring: {
          type: "object",
          properties: { page: { type: "integer", minimum: 1, maximum: 100, default: 1 } },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      try {
        const page = (request.query as { page?: number }).page ?? 1;
        const [arbeitnow, arbeitnowUk, jobicy, himalayas, remotive] = await Promise.allSettled([
          getListings(page),
          getListings(page, true),
          getJobicyListings(page),
          getHimalayasListings(page),
          getRemotiveListings(page),
        ]);
        const jobs = [
          ...(arbeitnow.status === "fulfilled" ? arbeitnow.value.jobs : []),
          ...(arbeitnowUk.status === "fulfilled" ? arbeitnowUk.value.jobs : []),
          ...(jobicy.status === "fulfilled" ? jobicy.value.jobs : []),
          ...(himalayas.status === "fulfilled" ? himalayas.value.jobs : []),
          ...(remotive.status === "fulfilled" ? remotive.value.jobs : []),
        ];
        const failures = [arbeitnow, arbeitnowUk, jobicy, himalayas, remotive].filter(
          (result) => result.status === "rejected",
        );
        if (jobs.length === 0 && failures.length === 5) {
          throw new AggregateError(
            failures.map((result) => (result as PromiseRejectedResult).reason),
            "All job sources failed",
          );
        }
        const uniqueJobs = [...new Map(jobs.map((job) => [job.url, job])).values()];
        const sources = [
          ...(arbeitnow.status === "fulfilled" ? (["Arbeitnow"] as const) : []),
          ...(arbeitnowUk.status === "fulfilled" ? (["Arbeitnow UK"] as const) : []),
          ...(jobicy.status === "fulfilled" ? (["Jobicy"] as const) : []),
          ...(himalayas.status === "fulfilled" ? (["Himalayas"] as const) : []),
          ...(remotive.status === "fulfilled" ? (["Remotive"] as const) : []),
        ];
        const hasMore =
          (arbeitnow.status === "fulfilled" && Boolean(arbeitnow.value.next)) ||
          (arbeitnowUk.status === "fulfilled" && Boolean(arbeitnowUk.value.next)) ||
          (jobicy.status === "fulfilled" && jobicy.value.hasMore) ||
          (himalayas.status === "fulfilled" && himalayas.value.hasMore);
        return { jobs: uniqueJobs, sources, page, hasMore };
      } catch (error) {
        request.log.error(error);
        return reply
          .status(502)
          .send({ message: "Job listings are temporarily unavailable. Try again shortly." });
      }
    },
  );
}
