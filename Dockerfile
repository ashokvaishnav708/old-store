# syntax=docker/dockerfile:1

# The `build` stage also doubles as the runtime image for the one-off
# `migrate` / `seed` services in docker-compose.yml, since those need
# drizzle-kit/tsx (devDependencies) and the full source tree.
FROM node:24-alpine AS build
WORKDIR /app

# Nitro's Redis-backed cache storage mount (nuxt.config.ts `nitro.storage`)
# is resolved at build time, not read from runtime env vars, so it needs
# the right value baked in here. Defaults to this compose network's hostname.
ARG REDIS_URL=redis://redis:6379
ENV REDIS_URL=$REDIS_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0

COPY --from=build /app/.output ./.output

EXPOSE 3000
USER node
CMD ["node", ".output/server/index.mjs"]
