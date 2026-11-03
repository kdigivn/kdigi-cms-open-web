---
title: Media library
description: Manage images and files in KDIGI CMS. Stored on the server disk by default, or on Cloudflare R2 per site; with folders, image editing and import from URL.
---

The media library collects each site's images and files, with folders for organisation and an image editor inside the admin panel.

## Two places to store files

The CMS decides **per upload, per site**:

| Condition | Storage |
| --- | --- |
| The site has Cloudflare R2 configured (bucket and account ID) | Cloudflare R2 |
| Anything else | Server disk |

A fresh install needs no storage service: images live on disk in `MEDIA_DIR` (in Docker, the `/app/media` volume). Different sites on the same install can use different backends.

## Turn on Cloudflare R2 for a site

Go to **Sites > System > Cloudflare R2** and fill in the bucket, account ID, public (CDN) URL and access keys. Only super admins can edit this group; the two secret keys are never returned over REST or GraphQL. There is also an option to convert images to WebP on upload.

There are no global R2 environment variables. Set `R2_OFF=true` to force every site onto disk (for example when developing against a copy of real data).

## Features

- **Folders** to organise images, separated per site.
- **Image editing** (crop, rotate and more) works on both backends.
- **Import from URL**: enter an address and the CMS downloads the file into the library, with protection that blocks internal addresses (SSRF guard).
- **File names** are normalised (diacritics removed, lowercase). The same name in the same site overwrites the old file.
- Media is publicly readable, since image URLs are embedded in published content. Only members of a site can upload, edit or delete.

Details (directory layout, cache headers, allowed file types) are in the [media storage reference](/en/tham-khao/media-storage/).
