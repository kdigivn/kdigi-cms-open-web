---
title: Quick start
description: Run KDIGI CMS on your machine in a few minutes with Docker Compose, including a demo site with sample content.
---

All you need is Docker with Compose. No separate Node.js or Postgres install: Compose starts both the database and the app.

## 1. Get the code

```bash
git clone https://github.com/kdigivn/kdigi-cms-open.git
cd kdigi-cms-open
```

## 2. Run with Docker Compose

```bash
SEED_DEMO=true docker compose up --build
```

`SEED_DEMO=true` loads a demo site with sample content so you have something to look at right away. Leave it out to start with an empty CMS. The first build takes a few minutes. The app runs migrations on start and generates its own `PAYLOAD_SECRET`, so you do not need a `.env` file.

## 3. Open the admin panel

Go to [http://localhost:3000/admin](http://localhost:3000/admin). There is no demo login: the first account you create on the form becomes the super admin. After signing in you will see the demo site (`siteKey` is `demo`) with sample posts, pages, categories and menus.

## 4. Fetch content from a frontend

Each website is a record in **Sites**. Your frontend reads content per site over REST or GraphQL. First look up the demo site's `id` by `siteKey`, then filter posts by that `id`:

```bash
curl "http://localhost:3000/api/sites?where[siteKey][equals]=demo"
curl "http://localhost:3000/api/posts?where[tenant][equals]=<site-id>&sort=-publishedAt&limit=5"
```

Anonymous visitors only see published content. Filtering by site and the other endpoints are covered in [REST and GraphQL](/en/api/rest-graphql/).

## Stop and reset

```bash
docker compose down        # stop, keep data
docker compose down -v     # stop and wipe all data (database, media)
```

## Next

- [Self-host with Docker](/en/huong-dan/cai-dat-docker/): configuration variables and running on a server.
- [Deploy on Coolify](/en/huong-dan/trien-khai-coolify/)
- [Migrate from WordPress](/en/wordpress/di-chuyen-tu-wordpress/)
