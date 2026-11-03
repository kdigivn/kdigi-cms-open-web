---
title: Self-host with Docker
description: How the KDIGI CMS Docker Compose stack works, the common configuration variables, where data lives and how to run it on a server.
---

`docker-compose.yml` in the repository starts two services: PostgreSQL 16 (`db`) and the application (`app`, port 3000). Migrations run automatically every time the app starts.

## Where data lives

Three named volumes keep data across `docker compose down`:

| Volume | Contents |
| --- | --- |
| `postgres_data` | The database |
| `media_data` | Uploaded images and files (`/app/media`) for sites without Cloudflare R2 |
| `app_data` | Application data, including the generated `PAYLOAD_SECRET` |

`docker compose down -v` removes all three.

## Common configuration variables

Set them in the environment or in a `.env` file next to `docker-compose.yml`. Running locally needs none of them.

| Variable | Default | Meaning |
| --- | --- | --- |
| `PAYLOAD_PUBLIC_SERVER_URL` | `http://localhost:3000` | Public address of the CMS as browsers see it; also the prefix of media URLs |
| `PAYLOAD_SECRET` | empty (generated once) | Session signing secret. Set your own on a server, at least 32 characters |
| `POSTGRES_PASSWORD` | `kdigi` | Database password |
| `APP_PORT` / `DB_PORT` | `3000` / `5432` | Host ports. The database listens on `127.0.0.1` only |
| `SEED_DEMO` | empty | `true` loads the demo site (safe to re-run) |
| `SKIP_MIGRATIONS` | empty | `true` skips the automatic migration step at container start |

The full list, including AI SEO, comment reCAPTCHA, OpenTelemetry and the WordPress importer, is in the repository's `.env.example` and in the [configuration reference](/en/tham-khao/configuration/).

## Running on a server

1. Set `PAYLOAD_PUBLIC_SERVER_URL` to the real `https://` address of the CMS and `PAYLOAD_SECRET` to a long random string (`openssl rand -hex 32`).
2. Change `POSTGRES_PASSWORD` from the default.
3. Put a TLS reverse proxy (Traefik, Caddy, nginx) in front of port 3000.
4. Keep the volumes so updating the image does not lose data.

If you use Coolify, read [Deploy on Coolify](/en/huong-dan/trien-khai-coolify/).

## Running the app outside Docker (development)

Start only the database with Compose and run Next.js on your machine:

```bash
docker compose up db
cp .env.example .env
pnpm install
pnpm migrate
pnpm dev
```

## Health check

`GET /api/health` returns 200 while the process is serving HTTP. It does not query the database, so do not treat it as proof that the schema is ready.
