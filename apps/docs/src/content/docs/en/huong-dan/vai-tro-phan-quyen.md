---
title: Roles and permissions
description: The four KDIGI CMS roles (super admin, admin, editor, author), per-site access and how accounts are assigned to sites.
---

Every account has a **role** and is assigned to one or more sites. Real access is the intersection of the two: the role decides what you can do, the assigned sites decide which content you can do it on.

## Four roles

| Role | Scope | Can do |
| --- | --- | --- |
| `super-admin` | All sites | Everything. The only role that creates or deletes users and sites, assigns users to sites and edits storage (R2) settings |
| `admin` | Assigned sites | Manage content, publish, moderate comments, edit site settings, delete permanently |
| `editor` | Assigned sites | Manage content, publish, moderate comments, move to trash |
| `author` | Assigned sites | Create content, edit and trash only their own documents. **Cannot publish** |

## Worth remembering

- **Authors submit, editors publish.** An author can save drafts but cannot set a document to published, nor edit a live document in place.
- **Per-site scoping is the real barrier.** An editor on site A cannot read or edit site B's content through the API.
- **A user with no site** cannot access any content.
- **Trash**: deleting a document moves it to the trash; only super admins and admins can delete permanently.
- **Anonymous visitors** can only read content that is published and due.

## Assigning users to sites

A super admin creates the user, picks a role and adds the sites that person may work on. An account with several sites gets a site selector in the admin panel.

The detailed per-collection permission table is in the [roles and permissions reference](/en/tham-khao/roles-and-permissions/).
