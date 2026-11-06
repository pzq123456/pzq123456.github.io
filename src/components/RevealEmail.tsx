import { useState } from "react";
import { Check, Copy, Lock, Mail } from "lucide-react";
import { useApp } from "@/context/AppContext";

const ENCODED_EMAIL = "cGFuemhpcWluZzE1QGdtYWlsLmNvbQ==";

export default function RevealEmail() {
  const { t } = useApp();
  const [step, setStep] = useState<"hidden" | "confirm" | "revealed">("hidden");
  const [copied, setCopied] = useState(false);

  const email = step === "revealed" ? atob(ENCODED_EMAIL) : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard may be unavailable; the address is still selectable
    }
  };

  if (step === "hidden") {
    return (
      <button
        type="button"
        onClick={() => setStep("confirm")}
        className="inline-flex items-center gap-2 text-[14px] font-medium text-ink-muted transition-colors hover:text-coral"
      >
        <Lock size={14} />
        {t({ en: "Reveal email", zh: "显示邮箱" })}
      </button>
    );
  }

  if (step === "confirm") {
    return (
      <div className="max-w-xs">
        <p className="text-[14px] leading-relaxed text-ink-muted">
          {t({
            en: "This contact is for humans. Reveal the address?",
            zh: "这是人工联系方式。确认显示邮箱？",
          })}
        </p>
        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setStep("revealed")}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-coral transition-colors hover:underline"
          >
            <Mail size={13} />
            {t({ en: "Reveal", zh: "显示" })}
          </button>
          <button
            type="button"
            onClick={() => setStep("hidden")}
            className="text-[13px] text-ink-muted transition-colors hover:text-ink-bold"
          >
            {t({ en: "Cancel", zh: "取消" })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={`mailto:${email}`}
        className="border-b border-line/60 pb-1 font-display text-[22px] text-ink-muted transition-colors hover:border-coral hover:text-coral md:text-[26px]"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1 text-[13px] text-ink-muted transition-colors hover:text-coral"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied
          ? t({ en: "Copied", zh: "已复制" })
          : t({ en: "Copy", zh: "复制" })}
      </button>
    </div>
  );
}
