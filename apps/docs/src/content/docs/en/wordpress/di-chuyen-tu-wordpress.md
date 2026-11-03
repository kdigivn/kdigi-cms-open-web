---
title: Migrate from WordPress
description: Move posts, pages, taxonomies, media, SEO data (Yoast, RankMath), menus, comments and redirects from any WordPress site to KDIGI CMS with a pipeline that has a review gate before anything is written.
---

KDIGI CMS ships a pipeline that migrates content from **any WordPress site**. The principle: **nothing is written to the database until you have reviewed and locked the intermediate data.** The pipeline runs from commands in the repository, needs no plugin on WordPress, and can be re-run without creating duplicate records.

## What is migrated

| From WordPress | To KDIGI CMS |
| --- | --- |
| Posts, pages | `posts`, `pages`: content converted to Markdown, publish dates kept |
| Categories, tags, custom taxonomies | `taxonomies`, parent/child tree kept |
| Media library | `media`, files downloaded into the [media library](/en/huong-dan/thu-vien-media/) |
| Menus | `menus`, multi-level |
| Authors | `authors` |
| Comments | `comments`, spam comments keep the `spam` status |
| Yoast SEO or RankMath | The `seo` group of each document: title, description, canonical, robots, Open Graph, Twitter, focus keyword |
| Old permalinks | `redirects` (301), generated when paths change |
| WooCommerce products (optional) | `products` |

**Not** migrated: themes, plugins, form configuration, WordPress login accounts, and content a page builder stores outside the post content.

## Workflow

```text
WordPress  →  raw/ (source snapshot)  →  staged/ (editable JSON)  →  review + lock  →  Payload
```

1. **Archive**: download a snapshot of the source. WPGraphQL is used when the site has it, otherwise the standard WordPress REST API (works on any site). Add an *Application Password* if you need private media or menus.
2. **Normalize**: turn the snapshot into `staged/` JSON files, one per item. HTML becomes Markdown, and Yoast or RankMath data is merged into one common schema.
3. **Review (gate)**: read and fix the `staged/` files (slugs, taxonomies, images, links, canonicals), run `--gate lint` until it is clean, then `--gate lock` to freeze them with a content hash. Editing `staged/` after the lock invalidates it.
4. **Import**: run the phases `schema → seed → taxonomy → content → media → seo → nav → comments → redirects`. Each phase re-checks the lock. `--dry-run` previews without writing.

An example starting command, run from the CMS repository:

```bash
node --env-file=.env --import tsx src/importers/run-wp-migration.ts \
  --site my-blog --wp-url https://wp.example.com --domain www.example.com --archive
```

`--site` is the `siteKey` of the website that receives the content in KDIGI CMS. Commands for each step are in the [runbook](/en/tham-khao/wordpress-migration/runbook/).

## Data safety

- A database that is not on the local machine always requires a `pg_dump` before writing, and there is no flag to skip it.
- A newly created site stops after the `seed` phase so you can configure media storage (R2, if you use it) before importing the rest.
- A successful import does not mean the website matches the old one. Compare URLs, canonicals, JSON-LD and images before switching the domain.

## After the import

1. Compare the old site's URL list and sitemap with the new one; every changed or missing URL needs a redirect.
2. Check canonicals, meta tags, Open Graph and [JSON-LD](/en/huong-dan/seo-json-ld/).
3. Check that images render and internal links do not point back to the old WordPress domain.
4. Point the domain at the new frontend.

Decisions for each WordPress setup (Yoast or RankMath, Gutenberg or Elementor, WooCommerce, multilingual, large media libraries) and known pitfalls are in the [playbook](/en/tham-khao/wordpress-migration/playbook/). The full overview is in [WordPress migration](/en/tham-khao/wordpress-migration/) (Vietnamese with an English summary).
