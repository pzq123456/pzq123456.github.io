export function formatDate(value: string, lang: "en" | "zh") {
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
