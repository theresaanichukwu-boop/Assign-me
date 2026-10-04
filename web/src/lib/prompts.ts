// Prompt packs — PRD §5 + §8. Discipline intelligence + work-type step guidance.
// Pure functions (unit-tested). The composer merges them with live workspace memory.

import type { ChatMessage } from "./ai";

export interface DisciplinePack {
  slug: string;
  label: string;
  conventions: string;
  structureNote: string;
  sourceGuidance: string;
}

export const DISCIPLINE_PACKS: Record<string, DisciplinePack> = {
  nursing: {
    slug: "nursing",
    label: "Nursing",
    conventions:
      "Use nursing terminology (evidence-based practice, patient outcomes, clinical care). " +
      "Reference nursing theories and frameworks where relevant.",
    structureNote:
      "Follow academic nursing structure: background, evidence, clinical implications, conclusion.",
    sourceGuidance:
      "Prefer peer-reviewed nursing and public-health journals; prioritize Nigerian/African clinical evidence where relevant.",
  },
  general: {
    slug: "general",
    label: "General Academic",
    conventions: "Use clear, level-appropriate academic language for the student's field.",
    structureNote: "Follow the structure required by the work type and school requirements.",
    sourceGuidance: "Prefer peer-reviewed journals, university publications, and official reports.",
  },
};

export function packForCourse(course: string | null): DisciplinePack {
  const c = (course ?? "").toLowerCase();
  if (c.includes("nurs")) return DISCIPLINE_PACKS.nursing;
  return DISCIPLINE_PACKS.general;
}

export interface BuilderContext {
  workTypeLabel: string;
  step: string;
  topic: string | null;
  objectives: unknown;
  priorSteps: Array<{ step: string; contentMd: string }>;
  citationStyle: string;
  level: string | null;
}

export function buildSectionPrompt(pack: DisciplinePack, ctx: BuilderContext): ChatMessage[] {
  const prior = ctx.priorSteps
    .map((s) => `## ${s.step}\n${s.contentMd.slice(0, 1500)}`)
    .join("\n\n");
  const objectives =
    Array.isArray(ctx.objectives) && ctx.objectives.length > 0
      ? ctx.objectives.join("; ")
      : String(ctx.objectives ?? "Not specified");
  return [
    {
      role: "system",
      content:
        `You are an academic writing assistant for a ${ctx.level ?? "university"} student. ` +
        `Discipline: ${pack.label}. ${pack.conventions} ${pack.structureNote} ${pack.sourceGuidance} ` +
        `Write in clear academic prose. Never invent references, authors, studies, or DOIs. ` +
        `Mark claims needing sources with [citation needed]. Cite in ${ctx.citationStyle} style where sources are used.`,
    },
    {
      role: "user",
      content:
        `Work type: ${ctx.workTypeLabel}\n` +
        `Topic: ${ctx.topic ?? "Not specified"}\n` +
        `Objectives: ${objectives}\n\n` +
        (prior ? `Work so far (for continuity, do not repeat verbatim):\n${prior}\n\n` : "") +
        `Now draft the "${ctx.step}" section only. Keep it focused and appropriately sized.`,
    },
  ];
}
