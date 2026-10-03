// Academic Reviewer — PRD §10. Deterministic checks (no AI model required).
// Severity report + fix suggestions. Advanced (LLM) review hooks in later.

import { checkConsistency } from "./citations";
import { getWorkType, workTypeSlugFromEnum } from "./work-types";

export interface ReviewIssue {
  severity: "high" | "medium" | "low";
  location: string;
  message: string;
  fix: string;
}

export interface ReviewReport {
  score: number; // 0–100
  issues: ReviewIssue[];
  summary: { high: number; medium: number; low: number };
}

interface ReviewInput {
  workTypeEnum: string;
  objectives: unknown;
  style: string;
  sections: Array<{ step: string; contentMd: string }>;
  sources: Array<{ id: string; authors: string | null; year: number | null }>;
  references: Array<{ id: string; sourceId: string | null }>;
}

function words(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9']+/).filter(Boolean);
}

function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 20);
}

function jaccard(a: string[], b: string[]): number {
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / Math.max(1, A.size + B.size - inter);
}

const CLAIM_HINT = /(studies show|research (shows|proves|suggests)|evidence (shows|suggests)|it is proven|significantly|majority of|most (nurses|patients|students)|increases? by \d|reduced? by \d|\d+\s*%)/i;
const CITATION_HINT = /\([A-Z][A-Za-z' -]+,?\s*\d{4}\)|\[\d+\]|\(\w+ et al\.,? \d{4}\)/;

export function runReview(input: ReviewInput): ReviewReport {
  const issues: ReviewIssue[] = [];
  const def = getWorkType(workTypeSlugFromEnum(input.workTypeEnum));
  const textByStep = new Map(input.sections.map((s) => [s.step, s.contentMd]));
  const fullText = input.sections.map((s) => s.contentMd).join("\n");

  // 1. Structure: missing builder steps.
  const missing = def.builderSteps.filter(
    (step) => step !== "references" && !(textByStep.get(step) ?? "").trim(),
  );
  for (const step of missing) {
    issues.push({
      severity: step === def.builderSteps[0] ? "high" : "medium",
      location: step,
      message: `Missing section: "${step.replace(/-/g, " ")}".`,
      fix: `Complete the "${step.replace(/-/g, " ")}" step in the builder before submitting.`,
    });
  }

  // 2. Objectives alignment: objective keywords should appear in later sections.
  const objText = Array.isArray(input.objectives)
    ? input.objectives.join(" ")
    : String(input.objectives ?? "");
  const objWords = new Set(words(objText).filter((w) => w.length > 4));
  if (objWords.size > 0) {
    const tail = def.builderSteps.slice(-3).map((s) => textByStep.get(s) ?? "").join(" ");
    const tailWords = new Set(words(tail));
    let hit = 0;
    for (const w of objWords) if (tailWords.has(w)) hit++;
    if (hit / objWords.size < 0.3 && tail.trim()) {
      issues.push({
        severity: "medium",
        location: "objectives ↔ findings",
        message: "Objectives keywords rarely appear in the closing sections — findings may not answer the objectives.",
        fix: "Revisit objectives or explicitly answer each one in the discussion/conclusion.",
      });
    }
  }

  // 3. Evidence: substantial work with no sources.
  const substantial = ["chapter-1", "literature-review", "discussion", "answer", "sections", "analysis"];
  const hasSubstance = input.sections.some(
    (s) => substantial.includes(s.step) && s.contentMd.trim().length > 200,
  );
  if (hasSubstance && input.sources.length === 0) {
    issues.push({
      severity: "high",
      location: "evidence",
      message: "Substantial content with no saved sources.",
      fix: "Run guided research and link claims to verified sources.",
    });
  }

  // 4. Citation consistency (reuse engine).
  const byId = new Map(input.sources.map((s) => [s.id, s]));
  for (const i of checkConsistency(
    fullText,
    input.references.map((r) => {
      const s = r.sourceId ? byId.get(r.sourceId) : undefined;
      return { id: r.id, authors: s?.authors ?? null, year: s?.year ?? null };
    }),
  )) {
    issues.push({
      severity: "medium",
      location: "references",
      message: i.message,
      fix: "Add the in-text citation or remove the unused reference.",
    });
  }

  // 5. Repetition: near-duplicate sentences.
  const sents = sentences(fullText).slice(0, 400);
  const seen: string[][] = [];
  let dupes = 0;
  for (const s of sents) {
    const w = words(s);
    if (seen.some((prev) => jaccard(prev, w) > 0.8)) {
      dupes++;
      continue;
    }
    seen.push(w);
  }
  if (dupes > 0) {
    issues.push({
      severity: dupes > 3 ? "medium" : "low",
      location: "writing",
      message: `${dupes} near-duplicate sentence${dupes > 1 ? "s" : ""} detected.`,
      fix: "Merge or rewrite repeated sentences.",
    });
  }

  // 6. Unsupported claims heuristic.
  let unsupported = 0;
  for (const s of sents) {
    if (CLAIM_HINT.test(s) && !CITATION_HINT.test(s)) unsupported++;
  }
  if (unsupported > 0) {
    issues.push({
      severity: unsupported > 5 ? "high" : "medium",
      location: "evidence",
      message: `${unsupported} claim-like sentence${unsupported > 1 ? "s" : ""} without a nearby citation.`,
      fix: "Attach a source to each empirical claim or soften the wording.",
    });
  }

  const high = issues.filter((i) => i.severity === "high").length;
  const medium = issues.filter((i) => i.severity === "medium").length;
  const low = issues.filter((i) => i.severity === "low").length;
  const score = Math.max(0, 100 - high * 15 - medium * 5 - low * 2);

  return { score, issues, summary: { high, medium, low } };
}
