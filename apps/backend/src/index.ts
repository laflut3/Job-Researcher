import Fastify from "fastify";
import type { HealthResponse } from "@job-researcher/shared";

const app = Fastify({ logger: true });

app.get(
  "/api/health",
  {
    schema: {
      response: {
        200: {
          type: "object",
          required: ["status"],
          properties: { status: { type: "string" } },
          additionalProperties: false,
        },
      },
    },
  },
  async (): Promise<HealthResponse> => ({ status: "ok" }),
);

const port = Number(process.env.PORT ?? 3000);

await app.listen({ port, host: "0.0.0.0" });
