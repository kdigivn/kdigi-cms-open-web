# syntax=docker/dockerfile:1.7
# cms.kdigi.vn: marketing homepage (Next.js standalone output). Build context = repository ROOT (pnpm workspace),
# Dockerfile path = apps/web/Dockerfile.
#
# Coolify: build pack Dockerfile, base directory /, port 3000, "Include Source Commit in Build" (SOURCE_COMMIT -> /api/health `version`).
# Environment variables (all are also declared as build ARGs, because the pages are prerendered at build time from the CMS):
#   CMS_URL            https://app.cms.kdigi.vn   (the CMS must be reachable while building)
#   CMS_SITE_KEY       opencms
#   REVALIDATE_SECRET  shared secret of POST /api/cms/revalidate (runtime only; without it the route answers 503)
#   NEXT_PUBLIC_SITE_URL / NEXT_PUBLIC_DOCS_URL / NEXT_PUBLIC_APP_URL   (optional, defaults are production hosts)

FROM node:22-bookworm-slim AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
# corepack provides pnpm at exactly the version pinned by `packageManager` in the root package.json
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json

FROM base AS deps
RUN --mount=type=cache,id=kdigi-web-pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter "web..." --store-dir /pnpm/store

FROM deps AS build
COPY apps/web apps/web
WORKDIR /app/apps/web
ARG CMS_URL
ARG CMS_SITE_KEY
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_DOCS_URL
ARG NEXT_PUBLIC_APP_URL
ENV CMS_URL=${CMS_URL} \
    CMS_SITE_KEY=${CMS_SITE_KEY} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_PUBLIC_DOCS_URL=${NEXT_PUBLIC_DOCS_URL} \
    NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
RUN pnpm run build && rm -rf .next/cache

FROM node:22-bookworm-slim AS runtime
ARG SOURCE_COMMIT=dev
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 GIT_SHA=${SOURCE_COMMIT} NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
# standalone = server.js + the traced subset of node_modules (monorepo layout: server.js ends up in apps/web because of
# outputFileTracingRoot); static assets and public/ are copied by hand as the Next.js `output` docs describe
COPY --from=build --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /app/apps/web/public ./apps/web/public
WORKDIR /app/apps/web
USER node
EXPOSE 3000
# liveness only (no CMS call): a CMS outage must not make Coolify restart the container
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
