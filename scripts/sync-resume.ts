// scripts/sync-resume.ts
//
// Website adapter: sync the bilingual resume catalog -> src/data/portfolio.generated.ts
//
// Run (see package.json "cv:sync"): npx --yes tsx scripts/sync-resume.ts
// Direct (Node >= 22.6, erasable syntax only): node scripts/sync-resume.ts
//
// Single source of truth = resume/data/base.json (the fact catalog). Variants
// (resume/data/variants/*.json) are overlays for PDF output only; the website
// always reads the shared catalog.
//
// Localization convention: a translatable leaf is either a plain string
// (language-neutral, e.g. a tech name or a date) or { en, zh }.
//
// Mapping rules:
// - basics.name / label -> PERSONAL_INFO name / title (kept bilingual).
// - skills[].name -> SKILLS_DATA.category; keywords -> items (bold stripped).
// - work[] -> EXPERIENCE_DATA: role / company bilingual, details per language,
//   tags = best-matching project stack (>= 2 keyword hits), else [].
// - education[] -> EDUCATION_DATA (school/degree bilingual; gpa via /GPA .../).
// - publications[0] -> PUBLICATION_DATA (single-object website contract).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ---------- resume schema (subset used by the website) ----------

type Lang = "en" | "zh";
interface I18nText {
  en: string;
  zh: string;
}
type Localized = I18nText | string;

interface ResumeProfile {
  network: string;
  username: string;
  url: string;
}

interface ResumeBasics {
  name: Localized;
  label: Localized;
  location: string;
  email: string;
  phone: string;
  url: string;
  profiles: ResumeProfile[];
}

interface ResumeSkill {
  name: Localized;
  keywords: Localized[];
}

interface ResumeWork {
  position: Localized;
  company: Localized;
  location?: Localized;
  startDate: string;
  endDate: string;
  highlights: Localized[];
}

interface ResumeProject {
  name: Localized;
  url: string;
  stack: string[];
  highlights: Localized[];
}

interface ResumeEducation {
  institution: Localized;
  startDate: string;
  endDate: string;
  summary: Localized;
}

interface ResumeLink {
  text: string;
  href: string;
}

interface ResumePublication {
  name: Localized;
  releaseDate: string;
  summary: Localized;
  links: ResumeLink[];
}

interface ResumeBase {
  basics: ResumeBasics;
  skills: ResumeSkill[];
  work: ResumeWork[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  publications: ResumePublication[];
}

// ---------- helpers ----------

const PERIOD_SEP = " — ";

/** Resolve a localized leaf to one language ("" when absent). */
function pick(v: Localized | null | undefined, lang: Lang): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  return v[lang] || v.en || v.zh || "";
}

/** Normalize any localized leaf to an I18nText (strings duplicated). */
function toI18n(v: Localized): I18nText {
  if (typeof v === "string") return { en: v.trim(), zh: v.trim() };
  return { en: (v?.en ?? "").trim(), zh: (v?.zh ?? "").trim() };
}

function stripBold(s: string): string {
  return s.replaceAll("**", "");
}

/** Best-matching project stack by keyword overlap (>= 2 hits), else []. */
function deriveTags(job: ResumeWork, projects: ResumeProject[]): string[] {
  const text = (Array.isArray(job.highlights) ? job.highlights : [])
    .map((h) => pick(h, "en") + "\n" + pick(h, "zh"))
    .join("\n")
    .toLowerCase();
  let best: string[] = [];
  let bestScore = 0;
  for (const p of projects) {
    if (!Array.isArray(p.stack)) continue;
    const score = p.stack.filter((t) => text.includes(t.toLowerCase())).length;
    if (score > bestScore) {
      bestScore = score;
      best = p.stack;
    }
  }
  return bestScore >= 2 ? [...best] : [];
}

const GPA_RE = /GPA\s*\**\s*([\d.]+\s*\/\s*[\d.]+)/;

function extractGpa(summary: string): string {
  const m = GPA_RE.exec(summary);
  return m !== null && m[1] !== undefined ? m[1].trim() : "";
}

function extractDoi(pub: ResumePublication): { doi: string; paper: string } {
  const links = Array.isArray(pub.links) ? pub.links : [];
  const doiLink = links.find((l) => l.href.includes("doi.org"));
  if (doiLink !== undefined) {
    const segs = doiLink.href.split("doi.org/");
    const doi = (segs.length > 1 ? segs.slice(1).join("doi.org/") : doiLink.text.replace(/^DOI:\s*/i, "")).trim();
    return { doi, paper: doiLink.href };
  }
  const textDoi = links
    .map((l) => l.text.replace(/^DOI:\s*/i, "").trim())
    .find((t) => t.includes("10."));
  return { doi: textDoi ?? "", paper: "" };
}

// ---------- main ----------

function main(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = resolve(here, "..");
  const basePath = resolve(root, "resume", "data", "base.json");
  const outPath = resolve(root, "src", "data", "portfolio.generated.ts");

  const raw = JSON.parse(readFileSync(basePath, "utf8")) as Partial<ResumeBase>;
  if (raw.basics === undefined) throw new Error(`sync-resume: missing "basics" in ${basePath}`);
  const basics: ResumeBasics = raw.basics;
  const skills: ResumeSkill[] = Array.isArray(raw.skills) ? raw.skills : [];
  const work: ResumeWork[] = Array.isArray(raw.work) ? raw.work : [];
  const projects: ResumeProject[] = Array.isArray(raw.projects) ? raw.projects : [];
  const education: ResumeEducation[] = Array.isArray(raw.education) ? raw.education : [];
  const publications: ResumePublication[] = Array.isArray(raw.publications) ? raw.publications : [];
  if (publications.length === 0 || publications[0] === undefined) {
    throw new Error(`sync-resume: "publications" is empty in ${basePath}; PUBLICATION_DATA needs one entry`);
  }
  const firstPub: ResumePublication = publications[0];

  const profiles = Array.isArray(basics.profiles) ? basics.profiles : [];
  const github = profiles.find((p) => p.network.toLowerCase() === "github")?.username ?? "";

  const personalInfo = {
    name: toI18n(basics.name),
    title: toI18n(basics.label),
    contact: {
      location: basics.location,
      github,
      website: basics.url,
    },
  };

  const skillsData = skills.map((s) => ({
    category: toI18n(s.name),
    iconName: pick(s.name, "en"),
    items: (Array.isArray(s.keywords) ? s.keywords : []).map((k) => stripBold(pick(k, "en"))),
  }));

  const experienceData = work.map((j) => {
    const loc = j.location !== undefined ? j.location : "";
    const company = {
      en: [pick(j.company, "en"), pick(loc, "en")].filter(Boolean).join(", "),
      zh: [pick(j.company, "zh"), pick(loc, "zh")].filter(Boolean).join(", "),
    };
    return {
      period: `${j.startDate}${PERIOD_SEP}${j.endDate}`,
      role: toI18n(j.position),
      company,
      details: {
        en: (j.highlights ?? []).map((h) => pick(h, "en")),
        zh: (j.highlights ?? []).map((h) => pick(h, "zh")),
      },
      tags: deriveTags(j, projects),
    };
  });

  const educationData = education.map((e) => {
    const en = pick(e.summary, "en");
    const zh = pick(e.summary, "zh");
    return {
      school: toI18n(e.institution),
      degree: toI18n(e.summary),
      date: `${e.startDate}${PERIOD_SEP}${e.endDate}`,
      gpa: extractGpa(en),
      isDistinction: en.includes("Distinction") || zh.includes("Distinction"),
    };
  });

  const { doi, paper } = extractDoi(firstPub);
  const links = Array.isArray(firstPub.links) ? firstPub.links : [];
  const codeLink = links.find((l) => l.text.trim().toLowerCase() === "code");
  const publicationData = {
    title: toI18n(firstPub.name),
    journal: firstPub.releaseDate,
    doi,
    role: toI18n(firstPub.summary),
    resources: {
      ...(codeLink !== undefined ? { github: codeLink.href } : {}),
      paper,
    },
  };

  const ts = (v: unknown): string => JSON.stringify(v, null, 2);

  const out = `// AUTO-GENERATED DO NOT EDIT
// Generated by scripts/sync-resume.ts from resume/data/base.json (bilingual fact catalog).
// Do not edit by hand — rerun: npx --yes tsx scripts/sync-resume.ts

export interface I18nText {
  en: string;
  zh: string;
}

// resume basics -> PERSONAL_INFO (bilingual; status/graduation stay website-only)
export const PERSONAL_INFO: {
  name: I18nText;
  title: I18nText;
  contact: { location: string; github: string; website: string };
} = ${ts(personalInfo)};

// resume skills -> SKILLS_DATA (category bilingual; iconName mapped to a lucide-react
// component by the frontend — the generated file carries no icon component)
export const SKILLS_DATA: { category: I18nText; iconName: string; items: string[] }[] = ${ts(skillsData)};

// resume work -> EXPERIENCE_DATA (period = "startDate — endDate"; details per language;
// tags = best-matching resume project stack with >= 2 keyword hits, else [])
export const EXPERIENCE_DATA: {
  period: string;
  role: I18nText;
  company: I18nText;
  details: { en: string[]; zh: string[] };
  tags: string[];
}[] = ${ts(experienceData)};

// resume education -> EDUCATION_DATA (school/degree bilingual; gpa via /GPA .../ on summary;
// isDistinction = summary includes "Distinction")
export const EDUCATION_DATA: {
  school: I18nText;
  degree: I18nText;
  date: string;
  gpa: string;
  isDistinction: boolean;
}[] = ${ts(educationData)};

// resume publications[0] -> PUBLICATION_DATA (single-object website contract).
export const PUBLICATION_DATA: {
  title: I18nText;
  journal: string;
  doi: string;
  role: I18nText;
  resources: { github?: string; paper: string };
} = ${ts(publicationData)};
`;

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, out, "utf8");
  console.log(`sync-resume: ${basePath} -> ${outPath}`);
  console.log(
    `sync-resume: skills=${skillsData.length} work=${experienceData.length} education=${educationData.length} publications=1`,
  );
}

main();
