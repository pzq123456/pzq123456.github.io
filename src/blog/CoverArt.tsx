import { useMemo, type CSSProperties } from "react";
import { createCoverFallbackStyle, createCoverParams } from "@/utils/cover";
import { getCoverImage } from "@/utils/coverRenderer";

interface CoverArtProps {
  /** Stable per-post seed, e.g. `${post.date}-${post.slug}`. */
  seed: string;
  className?: string;
  rounded?: boolean;
}

/**
 * React edge of the cover pipeline: params are pure, the WebGL renderer is a
 * cached singleton, and the CSS gradient is only a no-WebGL2 fallback.
 */
export default function CoverArt({
  seed,
  className = "",
  rounded = true,
}: CoverArtProps) {
  const params = useMemo(() => createCoverParams(seed), [seed]);
  // Cached by seed, so repeated renders trigger no extra GPU work.
  const image = useMemo(() => getCoverImage(seed), [seed]);
  const fallback = useMemo<CSSProperties>(
    () => createCoverFallbackStyle(params),
    [params],
  );

  const shape = `h-full w-full ${rounded ? "rounded-lg" : ""} ${className}`;

  if (image) {
    return (
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className={`${shape} object-cover`}
      />
    );
  }

  return <div aria-hidden="true" style={fallback} className={shape} />;
}
