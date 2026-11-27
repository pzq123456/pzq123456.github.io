import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { copyText } from "./copyText";

export default function ArticleCopyButton({ getText }: { getText: () => string }) {
  const { t } = useApp();
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const label = copied
    ? t({ en: "Copied", zh: "已复制" })
    : t({ en: "Copy article", zh: "复制全文" });

  async function handleCopy() {
    if (!(await copyText(getText()))) return;

    setCopied(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      title={label}
      data-copied={copied ? "" : undefined}
      className="inline-flex shrink-0 items-center gap-2 border border-line px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:border-accent hover:text-accent focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent data-[copied]:border-olive data-[copied]:text-olive"
    >
      {copied ? (
        <Check size={13} strokeWidth={1.75} />
      ) : (
        <Copy size={13} strokeWidth={1.75} />
      )}
      <span>{label}</span>
    </button>
  );
}
