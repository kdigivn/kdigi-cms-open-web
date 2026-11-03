---
title: REST and GraphQL
description: Use KDIGI CMS as a headless CMS. Read content per website over REST or GraphQL, with conventions for sites, Markdown, SEO and comments.
---

KDIGI CMS is headless: the admin panel lives at `/admin`, while the public website is a frontend of your choice (Next.js, Astro, Nuxt, PHP...). The frontend fetches content over REST or GraphQL provided out of the box by [Payload](https://payloadcms.com).

## REST

Each collection has an endpoint at `/api/<collection>`:

```bash
# the 5 latest posts of one site
curl "https://cms.example.com/api/posts?where[tenant][equals]=<site-id>&sort=-publishedAt&limit=5"

# one post by slug
curl "https://cms.example.com/api/posts?where[tenant][equals]=<site-id>&where[slug][equals]=hello-world"
```

Main content collections: `posts`, `pages`, `products`, `landings`, `taxonomies`, `menus`, `faqs`, `authors`, `redirects`, `media`, `sites`. Payload's query parameters (`where`, `sort`, `limit`, `page`, `depth`, `locale`) work as usual.

## GraphQL

The endpoint is `/api/graphql`. The playground is disabled in production and query complexity is capped. Note that rendering Markdown to HTML only applies to REST, so GraphQL consumers need to handle the `*Md` field themselves.

## Conventions to remember

- **Always filter by site.** Public reads do not filter by site on their own; add `where[tenant][equals]=<site-id>`. See [Multiple sites](/en/huong-dan/nhieu-website/).
- **Only published content** is returned to anonymous visitors: status `published` and already due.
- **Markdown is rendered.** REST returns HTML in the original field (`content`); the Markdown source is in `contentMd`. Shortcodes are already expanded. See [Markdown editor](/en/huong-dan/soan-thao-markdown/).
- **SEO**: an empty `seo.title` or `seo.description` means use the site template; the frontend replaces variables when building tags. `seo.jsonLd` is a prebuilt JSON-LD graph. See [SEO and JSON-LD](/en/huong-dan/seo-json-ld/).
- **Language**: content defaults to `vi`, with `en` available; pass `locale` to choose, missing translations fall back.
- **Menus** come back as a tree in `items`.
- **Site config**: the `sites` collection is publicly readable but secrets (R2 and so on) are never exposed.

## Authentication

Reading published content needs no login. To read drafts or write data, use a user account and API key:

```bash
curl -H "Authorization: users API-Key <api-key>" "https://cms.example.com/api/posts?where[status][equals]=draft"
```

Create the API key in the user's profile in the admin panel. A key has the same permissions as that user's role. See [Roles and permissions](/en/huong-dan/vai-tro-phan-quyen/).

## Comments and cache refresh

- Submit comments through the dedicated `POST /api/comments/create` endpoint (needs `postId` or `productId` and the site key); they start as pending. Set `RECAPTCHA_SECRET` to enable reCAPTCHA verification.
- On every content save the CMS queues a job that calls `POST https://<site domain>/api/cms/revalidate` so your frontend refreshes its cache. This needs `ENABLE_JOBS_AUTORUN=true` on one instance.

The full conventions are in the [REST API reference](/en/tham-khao/rest-api/).
