---
title: SEO and JSON-LD
description: Per-site title and description templates, per-document overrides, generated JSON-LD, SEO audit and internal-link suggestions.
---

KDIGI CMS ships a full SEO toolkit modelled on the familiar RankMath approach, in three layers.

## Three layers

| Layer | Where | Who edits |
| --- | --- | --- |
| 1. Site template | **Sites**: title/description templates for the homepage, posts, pages, products, landings and categories, plus a separator | Admins, once per site |
| 2. Document override | The `seo` field group on each post or page | Editors. **Empty means use the template** |
| 3. Resolve at render time | The frontend replaces variables in the template with real values | The frontend, on every render |

Template variables include `%title%`, `%sitename%`, `%sep%`, `%excerpt%`, `%category%`, `%focuskw%`, `%date%`, `%modified%`, `%term%` and `%currentyear%`. The CMS deliberately **does not store the resolved values**: changing a site template instantly applies to every document without an override, with no need to re-save each one. So an empty `seo.title` in REST is normal; your frontend must replace the variables when building the `<title>` tag.

## Generated JSON-LD

Every time a post, page, category or product is saved, the CMS builds a JSON-LD graph (BlogPosting, WebSite, Organization, BreadcrumbList, Person for authors, FAQPage when the document has FAQs, Product for products, and more) and stores it in `seo.jsonLd`. The frontend only has to embed it in a `<script type="application/ld+json">` tag.

The Open Graph image is picked in this order: the document's own OG image, its featured image, then the site default. You can also set the canonical URL, robots directives and Twitter card per document.

## Tools in the admin panel

- **SEO audit** scores a document against its focus keyword.
- **Internal-link suggestions** propose posts from the same site to link to.
- **Breadcrumbs** are generated automatically.
- **Redirects**: manage 301/302 redirects per site, essential when you [migrate from WordPress](/en/wordpress/di-chuyen-tu-wordpress/).
- **AI SEO (optional)**: buttons that generate titles, descriptions, OG image alt text and FAQs with AI. They only work when you set `DEEPSEEK_API_KEY`; without it the CMS works as usual.

The complete field table is in the [SEO reference](/en/tham-khao/seo/).
