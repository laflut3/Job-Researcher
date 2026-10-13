FROM node:22-alpine AS build

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@12.2.1 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile
COPY apps/frontend apps/frontend
COPY packages/shared packages/shared
RUN pnpm --filter @job-researcher/frontend build

FROM nginx:alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
