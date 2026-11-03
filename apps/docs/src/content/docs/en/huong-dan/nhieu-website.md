---
title: Multiple sites
description: Manage many websites from a single KDIGI CMS install. Each site has its own content, domain, branding, SEO and members.
---

KDIGI CMS is built multi-site. One install serves many independent websites: a personal blog, an agency's client sites, a product site. Each website is a record in the **Sites** collection.

## What a site has

- A domain, branding and display settings.
- Its own SEO templates (title, description, separator, variables such as `%title%` and `%sitename%`).
- Optional media storage on Cloudflare R2 (without it, the server disk is used).
- Its own content: posts, pages, categories, menus, FAQs, shortcodes, redirects, comments.
- A list of members allowed to work on that site.

Adding a site means creating a **Sites** record in the admin panel; the CMS itself is not redeployed. The site's frontend, domain and CDN are still yours to set up.

## Working across sites

Users who belong to several sites pick the active site in the admin panel; content lists are filtered to it. Super admins see every site.

## Fetching content per site from a frontend

Public read access filters by publication status only, **not** by site. A frontend must always add the site condition to its query, otherwise content from different websites will mix:

```bash
curl "https://cms.example.com/api/posts?where[tenant][equals]=<site-id>"
```

In code a "site" is called a `tenant`. See also [Roles and permissions](/en/huong-dan/vai-tro-phan-quyen/) and the [multi-site reference](/en/tham-khao/multi-site/).
