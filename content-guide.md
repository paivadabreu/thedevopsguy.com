# Content Guide

This site is static and GitHub Pages friendly. Most updates happen by editing JSON indexes and Markdown files.

## Blog Posts

Blog posts live in `blog/`.

To add a post:

1. Create a Markdown file in `blog/`, for example `2026-04-new-post.md`.
2. Add it to `blog/index.json`:

```json
{
  "title": "New Post Title",
  "file": "2026-04-new-post.md"
}
```

To remove a post, remove its entry from `blog/index.json`. You can also delete the Markdown file.

## Projects

Projects live in `projects/`.

To add a project:

1. Create a Markdown file in `projects/`, for example `new-project.md`.
2. Add a project entry to `projects/index.json`:

```json
{
  "title": "New Project",
  "slug": "new-project",
  "summary": "Short summary shown on the Projects tab.",
  "technologies": ["Azure", "Terraform"],
  "file": "new-project.md"
}
```

To remove a project, remove its entry from `projects/index.json`. You can also delete the Markdown file.

## Profile And Contact

- Profile content: `content/profile.json`
- Contact content: `content/contact.json`

No HTML or JavaScript changes are needed for normal content updates.