import { Check, Copy } from "lucide-react";
import { useRef, useState, type ComponentPropsWithoutRef } from "react";
import { copyText } from "./copyText";

type CodeFigureProps = ComponentPropsWithoutRef<"figure"> & {
  "data-rehype-pretty-code-figure"?: string;
};

export default function CodeFigure({ children, ...props }: CodeFigureProps) {
  const figureRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const isCodeBlock = "data-rehype-pretty-code-figure" in props;

  async function copyCode() {
    // Line numbers are CSS pseudo-elements, so textContent only contains code.
    const code = figureRef.current?.querySelector("pre")?.textContent;
    if (!code) return;

    if (!(await copyText(code.replace(/\n$/, "")))) return;

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <figure ref={figureRef} {...props}>
      {isCodeBlock && (
        <button
          type="button"
          className="code-copy"
          data-copied={copied ? "" : undefined}
          onClick={copyCode}
          aria-label={copied ? "Copied" : "Copy code"}
          title={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <Check size={14} strokeWidth={1.75} />
          ) : (
            <Copy size={14} strokeWidth={1.75} />
          )}
        </button>
      )}
      {children}
    </figure>
  );
}
