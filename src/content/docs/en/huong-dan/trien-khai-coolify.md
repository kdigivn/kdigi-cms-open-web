---
title: Deploy on Coolify
description: Deploy KDIGI CMS on Coolify with the Docker Compose resource shipped in the repository. Coolify issues the domain, TLS and the database password.
---

The repository ships `docker-compose.coolify.yml` for Coolify's **Docker Compose** resource type. It contains the app and PostgreSQL 16, with data in named volumes so redeploys never touch it.

## Steps

1. In Coolify: **New Resource → Docker Compose**, pick the repository `https://github.com/kdigivn/kdigi-cms-open` (or your fork), and set **Docker Compose Location** to `/docker-compose.coolify.yml`.
2. Add the environment variable `PAYLOAD_SECRET` with a random string of at least 32 characters (`openssl rand -hex 32`). It is the only required variable. Coolify generates the domain, TLS certificate and database password.
3. Attach a domain to the `app` service (port 3000). With a custom domain, also set `PAYLOAD_PUBLIC_SERVER_URL=https://cms.example.com`, otherwise the login page and media URLs use the Coolify-generated domain.
4. Deploy. The first start applies all migrations. Open `https://cms.example.com/admin` and create the first account; it becomes the super admin.

> **Create the first account right after deploying.** While the database is empty, anyone who can reach `/admin` can submit the first-user form and become a super admin.

To use an external PostgreSQL instead of the bundled one, set `DATABASE_URI` and remove the `db` service together with the `depends_on` entry of `app`.

## Optional variables

The compose file forwards `R2_OFF`, `ENABLE_JOBS_AUTORUN`, `FRONTEND_BASE_URL`, `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`, `RECAPTCHA_SECRET`, `MODERATION_WEBHOOK_URL`, `OTEL_SERVICE_NAME`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `SEED_DEMO` and `SKIP_MIGRATIONS`. A variable missing from the compose `environment:` block does not reach the container, so add it there if you use another one. Do not set `SEED_DEMO=true` on a real install: it creates a demo site and sample content.

## Media and background jobs

- Images are stored in the `media_data` volume (`/app/media`) by default. To keep them off the server, configure Cloudflare R2 per site. See [Media library](/en/huong-dan/thu-vien-media/).
- Every content save queues a "revalidate frontend" job so your website refreshes its cache. Jobs only run when `ENABLE_JOBS_AUTORUN=true`, and that variable must be enabled on **exactly one** instance.

## Backups

Back up both the database and the media, and keep the `PAYLOAD_SECRET` you use. Enable Coolify's scheduled database backups for the `postgres_data` volume and include `media_data` in your server backup.

The full guide to deployment, backups and troubleshooting is in [Deploy](/en/tham-khao/deploy/).
