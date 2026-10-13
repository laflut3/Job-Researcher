FROM node:22-alpine AS build

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@12.2.1 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile
COPY apps/backend apps/backend
COPY packages/shared packages/shared
RUN pnpm --filter @job-researcher/backend build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@12.2.1 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --prod --filter @job-researcher/backend... --frozen-lockfile
COPY --from=build /app/apps/backend/dist apps/backend/dist
EXPOSE 3000
CMD ["node", "apps/backend/dist/index.js"]
