import { useEffect, useState } from "react";

export type BlogRoute =
  | { name: "home" }
  | { name: "blog" }
  | { name: "post"; slug: string };

function parseHash(hash: string): BlogRoute {
  const path = hash.replace(/^#/, "");

  if (path === "/blog" || path === "/blog/") {
    return { name: "blog" };
  }

  if (path.startsWith("/blog/")) {
    const rawSlug = path.slice("/blog/".length).split("/")[0] ?? "";

    if (!rawSlug) {
      return { name: "blog" };
    }

    try {
      return { name: "post", slug: decodeURIComponent(rawSlug) };
    } catch {
      return { name: "blog" };
    }
  }

  return { name: "home" };
}

/**
 * Hash routes are used because GitHub Pages cannot fall back to index.html
 * for arbitrary paths. Existing section anchors such as #projects are left
 * untouched and fall through to the homepage.
 */
export function useHashRoute(): BlogRoute {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return parseHash(hash);
}
