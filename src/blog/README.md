# Blog

The blog is intentionally small: two hash routes, one explicit post registry,
and ordinary MDX files.

## Structure

```text
src/blog/
  posts.ts              # register posts here
  Blog.tsx              # list + article views
  useHashRoute.ts       # #/blog and #/blog/<slug>
  components/CodeBlock.tsx  # code-block title bar + copy button
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

## Code highlighting

Fenced blocks are highlighted at build time with Shiki's `vitesse-light` /
`vitesse-dark` theme pair, so code blocks follow the site theme. Every block
gets a faint copy button in its top-right corner; hover or keyboard focus
brings it forward. Optional fence metadata:

````md
```ts title="greet.ts" showLineNumbers {2}
export function greet(name: string) {
  return `Hello, ${name}!`;
}
```
````

- `title="..."` adds a filename header.
- `showLineNumbers` adds line numbers.
- `{2,5-7}` highlights those lines (ranges are allowed).

There is no client-side highlighter; the copy button is the only runtime
addition. Shiki emits both palettes as CSS variables and `.dark` selects one, so
theme switches are pure CSS. The theme pair and plugin live in `vite.config.ts`;
the frame, title and button are styled in `.article-body` inside `src/index.css`,
and the copy behaviour lives in `src/blog/components/CodeBlock.tsx`.

## Images

Put files in `public/blog/` and reference them with normal Markdown:

```md
![Alt text](/blog/example.png)
```

## Not included

Comments, RSS, search, tags, pagination, TOC, and a copy button are deliberately
left out. The article typography lives in `.article-body` in `src/index.css`.
