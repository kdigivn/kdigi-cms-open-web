---
title: "KDIGI CMS documentation"
description: "Reference documentation for KDIGI CMS, an AI-native, open-source headless multi-site CMS (Payload 3 + Next.js 15 + PostgreSQL): editors work in the admin, frontends read…"
editUrl: https://github.com/kdigivn/kdigi-cms-open/edit/main/docs/README.md
---

Reference documentation for KDIGI CMS, an AI-native, open-source headless multi-site CMS (Payload 3 + Next.js 15 + PostgreSQL): editors work in the admin, frontends read REST/GraphQL, and AI agents write and publish through the built-in [MCP server](/en/tham-khao/ai-integration/). Website: <https://opencms.kdigi.vn> · hosted docs: <https://docs.opencms.kdigi.vn> · live demo: <https://app.opencms.kdigi.vn/admin> (credentials in the root [README](https://github.com/kdigivn/kdigi-cms-open/blob/main/README.en.md#try-it-live)). The reference docs are written in English (the [WordPress migration](/en/tham-khao/wordpress-migration/) guides are in Vietnamese); the root [README](https://github.com/kdigivn/kdigi-cms-open/blob/main/README.md) is in Vietnamese with an [English version](https://github.com/kdigivn/kdigi-cms-open/blob/main/README.en.md).

## Start here

| Doc | Read it when you want to… |
| --- | --- |
| [Getting started](/en/tham-khao/getting-started/) | run KDIGI CMS locally with Docker Compose or `pnpm dev`, log in, and create your first site |
| [Configuration](/en/tham-khao/configuration/) | look up every environment variable and where each one is read |
| [Deploy](/en/tham-khao/deploy/) | run in production: Docker, Coolify, a generic VPS, backups, health checks |
| [Upgrading](/en/tham-khao/upgrading/) | move to a new version and run database migrations safely |

## Using the CMS

| Doc | Topic |
| --- | --- |
| [Multi-site](/en/tham-khao/multi-site/) | the Sites model: one install, many websites |
| [Roles and permissions](/en/tham-khao/roles-and-permissions/) | `super-admin`, `admin`, `editor`, `author` and how site isolation is enforced |
| [Content model](/en/tham-khao/collections/) | every collection, its fields, drafts/versions and localisation |
| [Markdown editor and shortcodes](/en/tham-khao/content-markdown/) | the Milkdown editor, the HTML your frontend receives, shortcode syntax |
| [SEO](/en/tham-khao/seo/) | JSON-LD, title/description placeholders, audit, optional AI generation |
| [Media and storage](/en/tham-khao/media-storage/) | local-disk default, per-site Cloudflare R2, image tools |
| [WordPress migration](/en/tham-khao/wordpress-migration/) | import an existing WordPress site |
| [AI integration (MCP & CLI)](/en/tham-khao/ai-integration/) | let Claude Code, Codex, Cursor, VS Code or OMP write and publish content; the `kcms` CLI |

## Building a frontend / extending

| Doc | Topic |
| --- | --- |
| [REST and GraphQL API](/en/tham-khao/rest-api/) | the public contract frontends rely on |
| [Architecture](/en/tham-khao/architecture/) | stack, source layout, hooks, jobs, custom endpoints |
| [Admin theming](/en/tham-khao/admin-theming/) | rebrand and restyle the admin panel |

## Project files

[Contributing](https://github.com/kdigivn/kdigi-cms-open/blob/main/CONTRIBUTING.md) · [Security policy](https://github.com/kdigivn/kdigi-cms-open/blob/main/SECURITY.md) · [Code of Conduct](https://github.com/kdigivn/kdigi-cms-open/blob/main/CODE_OF_CONDUCT.md) · [Changelog](https://github.com/kdigivn/kdigi-cms-open/blob/main/CHANGELOG.md) · [License (MIT)](https://github.com/kdigivn/kdigi-cms-open/tree/main/LICENSE)
