# syntax=docker/dockerfile:1.7
# docs.opencms.kdigi.vn: static docs site (Astro + Starlight build -> nginx). Build context = repository ROOT
# (pnpm workspace), Dockerfile path = apps/docs/Dockerfile.
#
# Coolify: build pack Dockerfile, base directory /, port 80. "Include Source Commit in Build" fills SOURCE_COMMIT (-> /version.txt).

FROM node:22-bookworm-slim AS build
ENV CI=true ASTRO_TELEMETRY_DISABLED=1 COREPACK_ENABLE_DOWNLOAD_PROMPT=0
WORKDIR /app
# corepack provides pnpm at exactly the version pinned by `packageManager` in the root package.json
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/docs/package.json apps/docs/package.json
RUN --mount=type=cache,id=kdigi-docs-pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter "docs..." --store-dir /pnpm/store
COPY apps/docs apps/docs
WORKDIR /app/apps/docs
ARG SOURCE_COMMIT=dev
RUN pnpm build \
    && printf '%s\n' "${SOURCE_COMMIT}" > dist/version.txt \
    && chmod -R a+rX dist

FROM nginx:1.27-alpine
COPY apps/docs/nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/docs/security-headers.inc /etc/nginx/conf.d/security-headers.inc
COPY --from=build /app/apps/docs/dist /usr/share/nginx/html
EXPOSE 80
# busybox wget; /version.txt carries the deployed commit sha
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1/version.txt >/dev/null || exit 1
