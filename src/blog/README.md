# Blog

The blog is intentionally small: two hash routes, one explicit post registry,
and ordinary MDX files.

## Structure

```text
src/blog/
  posts.ts              # register posts here
  Blog.tsx              # list + article views
  useHashRoute.ts       # #/blog and #/blog/<slug>
  posts/*.mdx           # articles
  demos/*.tsx           # interactive components used by articles
```

## Add a post

1. Create `src/blog/posts/my-post.mdx`.
2. Import it and append one entry to `REGISTRY` in `src/blog/posts.ts`:

```ts
import MyPost from "./posts/my-post.mdx";

// ...
{
  slug: "my-post",
  title: "Article title",
  date: "2026-11-17",
  description: "One sentence for the listing.",
  Content: MyPost,
}
```

3. Write the article. The title, date, and description live in the registry, so
   the MDX body should start with a paragraph or a `##` heading, not another
   `#` title.
4. Run `npm run dev`, then push to `main`.

Posts are sorted by `date` (newest first). URL: `#/blog/my-post`.

## Interactive demos

Demos are normal React components. Import and use them directly:

```mdx
import ExampleDemo from "../demos/ExampleDemo";

<ExampleDemo />
```

They can use hooks, SVG, canvas, CSS animations, and existing project
dependencies. Website theme tokens are available as CSS variables such as
`var(--brand-accent)`, `var(--text-base)`, and `var(--border-color)`.

## Math

Math is rendered at build time with KaTeX:

```md
Inline: $E = mc^2$

$$
\int_0^1 x^2 \, dx = \frac{1}{3}
$$
```

No client-side math runtime is shipped; only the KaTeX stylesheet and font files
are part of the built site.

## Images

Put files in `public/blog/` and reference them with normal Markdown:

```md
![Alt text](/blog/example.png)
```

## Not included

Comments, RSS, search, tags, pagination, TOC, and math rendering are deliberately
left out. The article typography lives in `.article-body` in `src/index.css`.
