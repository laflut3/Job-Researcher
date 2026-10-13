import type { FastifyInstance } from "fastify";
import { getListings } from "../sources/arbeitnow.js";

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
        const result = await getListings(page);
        return { jobs: result.jobs, source: "Arbeitnow", page, hasMore: Boolean(result.next) };
      } catch (error) {
        request.log.error(error);
        return reply
          .status(502)
          .send({ message: "Job listings are temporarily unavailable. Try again shortly." });
      }
    },
  );
}
