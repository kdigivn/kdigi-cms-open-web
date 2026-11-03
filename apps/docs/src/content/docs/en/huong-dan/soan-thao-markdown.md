---
title: Markdown editor
description: KDIGI CMS's WYSIWYG editor stores plain Markdown, the API returns rendered HTML, and shortcodes are supported per site.
---

Posts, pages, categories and FAQs are written in an editor built on [Milkdown](https://milkdown.dev). You type and format visually; what gets stored is plain Markdown, which is easy to back up, diff and move elsewhere.

## How data is stored and returned

- The editor saves Markdown into the field with the `Md` suffix (for example `contentMd`).
- When a frontend calls REST, the CMS returns **rendered HTML** in the original field (`content`). The frontend does not have to parse Markdown itself.
- If the `Md` field has content, Markdown is always the source of truth.

## Images and media

Insert images from the [media library](/en/huong-dan/thu-vien-media/) right inside the editor. Images are stored on disk or Cloudflare R2 depending on the site's configuration.

## Shortcodes

A shortcode is a reusable piece of content, managed in each site's **Shortcodes** collection, for example an ad block, a notice box or contact details. Insert one into a post with the `[sc …]` syntax; the CMS expands it when serving REST, only within the current site and up to three levels of nesting.

## Markdown, not arbitrary HTML

Because Markdown is stored, you get clean structure: headings, lists, tables, images, links and code blocks. For anything more complex, build it as a shortcode or a landing-page block instead of hand-inserting HTML.

Technical details are in the [Markdown content reference](/en/tham-khao/content-markdown/).
