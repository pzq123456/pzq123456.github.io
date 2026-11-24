// scripts/sync-resume.ts
//
// Website adapter: sync the bilingual resume catalog -> src/data/portfolio.generated.ts
//
// Single source of truth = resume/data/base.json (the fact catalog). Variants
// (resume/data/variants/*.json) are overlays for PDF output only; the website
// always reads the shared catalog.
//
// Localization convention: a translatable leaf is either a plain string
// (language-neutral, e.g. a tech name or a date) or { en, zh }.
// Catalog bullets are authored as { id, text: { en, zh } }; the id is metadata
// and is dropped when generating website copy.
//
// Mapping rules:
// - basics.name / label -> PERSONAL_INFO name / title (kept bilingual).
// - work[].skills       -> EXPERIENCE_DATA tags (skills shown on each job).
// - work[].highlights   -> EXPERIENCE_DATA details per language.
// - education[]         -> EDUCATION_DATA; publications[0] -> PUBLICATION_DATA.
// - gallery[]           -> GALLERY_PROJECTS (all website copy lives in base.json).

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
  username?: string;
  url: string;
}

interface ResumeBasics {
  name: Localized;
  label: Localized;
  location: Localized;
  email: string;
  phone: string;
  url: string;
  profiles: ResumeProfile[];
}

interface ResumeSkill {
  name: Localized;
  keywords: Localized[];
}

// Bullets in the catalog carry a stable id; older/plain forms are also accepted.
type ResumeHighlight = Localized | { id?: string; text: Localized };

interface ResumeWork {
  position: Localized;
  company: Localized;
  location?: Localized;
  startDate: string;
  endDate: string;
  skills?: string[];
  highlights: ResumeHighlight[];
}

interface ResumeProject {
  name: Localized;
  url: string;
  stack: string[];
  highlights: ResumeHighlight[];
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

interface ArchNode {
  label: string;
  hint: string;
}
interface Architecture {
  en: Record<string, ArchNode>;
  zh: Record<string, ArchNode>;
}

interface ResumeGalleryProject {
  id: string;
  title: Localized;
  meta: Localized;
  desc: Localized;
  imageKey: string | null;
  blogSlug?: string;
  resources: { github?: string; website?: string };
  architecture?: Architecture;
}

interface ResumeBase {
  basics: ResumeBasics;
  skills?: ResumeSkill[];
  work: ResumeWork[];
  projects: ResumeProject[];
  gallery: ResumeGalleryProject[];
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

/** Pick a catalog bullet, whether it is { id, text } or a plain localized leaf. */
function pickHighlight(h: ResumeHighlight, lang: Lang): string {
  if (typeof h === "object" && h !== null && "text" in h) {
    return pick((h as { text: Localized }).text, lang);
  }
  return pick(h as Localized, lang);
}

/** Normalize any localized leaf to an I18nText (strings duplicated). */
function toI18n(v: Localized): I18nText {
  if (typeof v === "string") return { en: v.trim(), zh: v.trim() };
  return { en: (v?.en ?? "").trim(), zh: (v?.zh ?? "").trim() };
}

function stripBold(s: string): string {
  return s.replaceAll("**", "");
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
  const gallery: ResumeGalleryProject[] = Array.isArray(raw.gallery) ? raw.gallery : [];
  const education: ResumeEducation[] = Array.isArray(raw.education) ? raw.education : [];
  const publications: ResumePublication[] = Array.isArray(raw.publications) ? raw.publications : [];
  if (publications.length === 0 || publications[0] === undefined) {
    throw new Error(`sync-resume: "publications" is empty in ${basePath}; PUBLICATION_DATA needs one entry`);
  }
  const firstPub: ResumePublication = publications[0];

  const profiles = Array.isArray(basics.profiles) ? basics.profiles : [];
  const githubProfile = profiles.find((p) => p.network.toLowerCase() === "github");
  const github =
    githubProfile?.username ||
    githubProfile?.url?.split("/").filter(Boolean).pop() ||
    "";

  const personalInfo = {
    name: toI18n(basics.name),
    title: toI18n(basics.label),
    contact: {
      location: pick(basics.location, "en"),
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
        en: (j.highlights ?? []).map((h) => pickHighlight(h, "en")),
        zh: (j.highlights ?? []).map((h) => pickHighlight(h, "zh")),
      },
      // Explicit skills per experience come straight from the catalog.
      tags: Array.isArray(j.skills) ? [...j.skills] : [],
    };
  });

  const galleryData = gallery.map((p) => ({
    id: p.id,
    title: toI18n(p.title),
    meta: toI18n(p.meta),
    desc: toI18n(p.desc),
    imageKey: p.imageKey,
    blogSlug: p.blogSlug ?? null,
    resources: p.resources,
    architecture: p.architecture ?? null,
  }));

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

export interface ArchNode { label: string; hint: string }
export interface Architecture {
  en: Record<string, ArchNode>;
  zh: Record<string, ArchNode>;
}

export interface GalleryProject {
  id: string;
  title: I18nText;
  meta: I18nText;
  desc: I18nText;
  imageKey: string | null;
  blogSlug: string | null;
  resources: { github?: string; website?: string };
  architecture: Architecture | null;
}

// resume basics -> PERSONAL_INFO
export const PERSONAL_INFO: {
  name: I18nText;
  title: I18nText;
  contact: { location: string; github: string; website: string };
} = ${ts(personalInfo)};

// Optional legacy skill catalog (the website now highlights skills per experience).
export const SKILLS_DATA: { category: I18nText; iconName: string; items: string[] }[] = ${ts(skillsData)};

// resume work -> EXPERIENCE_DATA (period, bilingual role/company/details,
// tags = work[].skills from the catalog)
export const EXPERIENCE_DATA: {
  period: string;
  role: I18nText;
  company: I18nText;
  details: { en: string[]; zh: string[] };
  tags: string[];
}[] = ${ts(experienceData)};

// resume gallery -> GALLERY_PROJECTS (all copy lives in base.json)
export const GALLERY_PROJECTS: GalleryProject[] = ${ts(galleryData)};

// resume education -> EDUCATION_DATA
export const EDUCATION_DATA: {
  school: I18nText;
  degree: I18nText;
  date: string;
  gpa: string;
  isDistinction: boolean;
}[] = ${ts(educationData)};

// resume publications[0] -> PUBLICATION_DATA
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
    `sync-resume: work=${experienceData.length} gallery=${galleryData.length} education=${educationData.length} publications=1`,
  );
}

main();
