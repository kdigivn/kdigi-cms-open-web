---
title: AI agents and MCP
description: Connect Claude Code, Codex, Cursor, VS Code or OMP to KDIGI CMS through the built-in MCP server and the kcms CLI to write, edit, schedule, publish and SEO-check content.
---

KDIGI CMS is an AI-native CMS: a [Model Context Protocol](https://modelcontextprotocol.io) server is built in at `POST /api/mcp`, so AI agents (Claude Code, Codex, Cursor, VS Code, OMP, …) read, write, schedule, publish and SEO-check content directly in the CMS. The agent works **as the user who owns the API key**: same role, same assigned sites, exactly as when that person signs in to the admin.

> The MCP server and the `kcms` CLI ship in KDIGI CMS 1.2.0. The public demo account cannot create an API key, so try it on a [self-hosted](/en/huong-dan/cai-dat-docker/) install.

## What an agent can do

| Group | Tools |
| --- | --- |
| Identity, sites | `whoami`, `list_sites`, `get_site` |
| Find and read | `search_content`, `get_content` (Markdown body, SEO, `updatedAt`) |
| Write | `create_post`, `create_page` (draft by default), `update_post`, `update_page` |
| Publish | `set_status`: publish, unpublish, schedule with a future `publishedAt` |
| Undo | `trash_content`, `restore_from_trash`, `list_versions`, `restore_version` |
| Categories, tags | `list_taxonomies`, `create_taxonomy` |
| Media | `search_media`, `import_media_from_url`, `update_media_alt` |
| SEO | `seo_audit`, `get_seo_report` (the same scorer as the admin) |
| Other | `list_shortcodes`, `get_content_urls` |

Plus the resource `kcms://guide/content` (Markdown, shortcode and SEO rules) and two prompts, `write-post` and `refresh-seo`.

## 1. Create an API key for the agent

Give each agent or person **its own account** with the lowest role that does the job: an `author` only creates drafts, an `editor` can publish and schedule. Avoid `super-admin` keys.

1. A super admin opens **Users**, creates the account (e.g. `ai-writer@example.com`) and picks the role and sites.
2. Open that account, tick **Enable API Key**, copy the key and **Save**.
3. Put the key in an environment variable where the agent runs: `export KCMS_API_KEY=change-me`.

API-key sessions are restricted on every REST, GraphQL and MCP route: they cannot change the account's email, password, API key, role or sites, cannot create users and cannot delete permanently (only move to the trash). If a key leaks, untick **Enable API Key**.

## 2. Connect your AI tool

The quickest path is the `kcms` CLI: it writes the right config file for each tool and never copies the key into it.

```bash
npm install -g @kdigi/kcms-cli
export KCMS_API_KEY=change-me
kcms setup claude-code --url https://cms.example.com --write --with-skill
```

Replace `claude-code` with `codex`, `cursor`, `vscode`, `omp` or `json`. Drop `--write` to only print the config. `--with-skill` also installs the agent skill that teaches a safe editorial workflow: read before editing, draft first, publish only when asked.

To configure it yourself, for example Claude Code's `.mcp.json`:

```json
{
  "mcpServers": {
    "kdigi": {
      "type": "http",
      "url": "https://cms.example.com/api/mcp",
      "headers": { "Authorization": "Bearer ${KCMS_API_KEY}" }
    }
  }
}
```

Configs for Codex, Cursor, VS Code, OMP and the stdio bridge (`kcms mcp`) for stdio-only tools are in the [AI integration reference](/en/tham-khao/ai-integration/).

## 3. How the agent stays safe

- **Drafts first.** New documents are drafts; drafts have no public URL, so the agent returns an admin link for you to review.
- **No overwriting someone's fresh edit.** Every update carries `expectedUpdatedAt` from the last read; if someone saved in between, the call fails with `conflict` and changes nothing.
- **Admin edit locks are respected.** If an editor has the document open, the agent gets `locked` and never steals the lock.
- **Right role, right site.** An author cannot publish; sites the key is not a member of are invisible.
- **Undoable.** Trash and version history work as in the admin.
- **Logged.** Each tool call writes one `agent-op` log line (tool, user, site, document, outcome), never bodies or keys.

## 4. Use the CLI without an agent

`kcms` is also a command-line tool: fetch a post as a Markdown file with frontmatter, edit it in your usual editor and push it back.

```bash
kcms login --url https://cms.example.com
kcms posts get my-post -o my-post.md
kcms posts update my-post.md
kcms media upload ./cover.webp --alt "Cover"
kcms seo audit
```

## Operating it

- The MCP server is on by default; set `MCP_ENABLED=false` to turn it off (the route answers 404). See [configuration](/en/tham-khao/configuration/).
- Give `/api/mcp` at least a 30-second proxy timeout and a rate limit at the reverse proxy (the CMS has none).
- Use HTTPS only: the key travels in a header.
- ChatGPT and Claude.ai on the web require OAuth, which is not supported yet; use the desktop/CLI tools above or the stdio bridge.

Full tool list, error handling and connection tests: [AI integration reference](/en/tham-khao/ai-integration/). What each role may do: [Roles and permissions](/en/huong-dan/vai-tro-phan-quyen/).
