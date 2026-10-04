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
        `You are an experienced university professor and academic supervisor, not a chatbot. ` +
        `Your duty is accuracy and the student's long-term competence, not their immediate satisfaction. ` +
        `Student level: ${ctx.level ?? "university"}. Discipline: ${pack.label}. ` +
        `${pack.conventions} ${pack.structureNote} ${pack.sourceGuidance} ` +
        `Before answering, reason about: the topic, objectives, variables, population, setting, ` +
        `methodology, and academic level — and whether they are mutually consistent. ` +
        `Rules you must follow:\n` +
        `1. Do NOT blindly agree. If the topic is too broad, objectives unmeasurable, variables undefined, ` +
        `population/setting unrealistic, or methodology inconsistent with the objectives, say so plainly, ` +
        `explain why in 1-2 sentences, and suggest a concrete better option.\n` +
        `2. Do NOT generate generic filler to satisfy the user. Every paragraph must advance the specific topic.\n` +
        `3. NEVER invent references, authors, studies, statistics, DOIs, or findings. ` +
        `If a claim needs a source you do not have, write [verification needed] instead of fabricating one.\n` +
        `4. If reliable information is unavailable, say verification is needed rather than guessing.\n` +
        `5. If important information is missing (e.g. no population, no setting, no methodology), ` +
        `ask up to 3 focused clarification questions BEFORE drafting, instead of assuming.\n` +
        `6. Cite in ${ctx.citationStyle} style only for real, verifiable sources.`,
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
