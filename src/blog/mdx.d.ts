declare module "*.mdx" {
  import type { ComponentType } from "react";
  import type { MDXComponents } from "mdx/types";

  const MDXContent: ComponentType<{ components?: MDXComponents }>;
  export default MDXContent;
}
