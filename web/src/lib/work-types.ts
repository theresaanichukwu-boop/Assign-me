// Work-type registry — PRD §4 + §8. Single source of truth for structures,
// intake fields, builder steps, and reviewer checklists. No forced Chapter 1–5.

export const WORK_TYPES = [
  "project",
  "seminar",
  "assignment",
  "term-paper",
  "essay",
  "lit-review",
  "case-study",
  "proposal",
  "presentation",
] as const;

export type WorkTypeSlug = (typeof WORK_TYPES)[number];

export interface IntakeField {
  name: string;
  label: string;
  required: boolean;
}

export interface WorkTypeDef {
  slug: WorkTypeSlug;
  label: string;
  structures: string[];
  intake: IntakeField[];
  builderSteps: string[];
  reviewerChecks: string[];
}

const req = (name: string, label: string): IntakeField => ({ name, label, required: true });
const opt = (name: string, label: string): IntakeField => ({ name, label, required: false });

const BASE_REVIEWER_CHECKS = [
  "structure-fits-work-type",
  "citation-reference-consistency",
  "repetition",
  "unsupported-claims",
  "missing-sections",
  "requirements-compliance",
];

export const WORK_TYPE_REGISTRY: Record<WorkTypeSlug, WorkTypeDef> = {
  project: {
    slug: "project",
    label: "Research Project",
    structures: ["chapters-1-5", "article-format"],
    intake: [req("topic", "Topic"), opt("objectives", "Objectives"), opt("population", "Population"), opt("location", "Location"), opt("method", "Methodology"), req("style", "Referencing style")],
    builderSteps: ["topic", "objectives", "questions", "chapter-1", "literature-review", "methodology", "results", "discussion", "conclusion", "references"],
    reviewerChecks: [...BASE_REVIEWER_CHECKS, "objectives-questions-findings-alignment", "methodology-soundness"],
  },
  seminar: {
    slug: "seminar",
    label: "Seminar",
    structures: ["topic-outline-discussion-conclusion"],
    intake: [req("topic", "Topic"), opt("objectives", "Objectives"), opt("structure", "Required structure"), req("style", "Referencing style")],
    builderSteps: ["topic", "outline", "research", "discussion", "conclusion", "references"],
    reviewerChecks: [...BASE_REVIEWER_CHECKS, "argument-flow"],
  },
  assignment: {
    slug: "assignment",
    label: "Assignment",
    structures: ["question-answer"],
    intake: [req("question", "Assignment question"), req("course", "Course"), opt("instructions", "Instructions"), opt("words", "Word count"), req("style", "Referencing style")],
    builderSteps: ["question", "research", "structure", "answer", "references"],
    reviewerChecks: [...BASE_REVIEWER_CHECKS, "question-answered"],
  },
  "term-paper": {
    slug: "term-paper",
    label: "Term Paper",
    structures: ["intro-body-conclusion"],
    intake: [req("topic", "Topic"), opt("question", "Guiding question"), opt("words", "Word count"), req("style", "Referencing style")],
    builderSteps: ["topic", "outline", "research", "sections", "conclusion", "references"],
    reviewerChecks: BASE_REVIEWER_CHECKS,
  },
  essay: {
    slug: "essay",
    label: "Essay",
    structures: ["intro-arguments-conclusion"],
    intake: [req("topic", "Topic"), opt("words", "Word count"), req("style", "Referencing style")],
    builderSteps: ["topic", "thesis", "arguments", "conclusion", "references"],
    reviewerChecks: [...BASE_REVIEWER_CHECKS, "thesis-support"],
  },
  "lit-review": {
    slug: "lit-review",
    label: "Literature Review",
    structures: ["conceptual-theoretical-empirical"],
    intake: [req("topic", "Topic"), opt("yearRange", "Year range"), opt("words", "Word count"), req("style", "Referencing style")],
    builderSteps: ["topic", "search-strategy", "conceptual", "theoretical", "empirical", "gap", "references"],
    reviewerChecks: [...BASE_REVIEWER_CHECKS, "coverage-recency", "synthesis-vs-summary"],
  },
  "case-study": {
    slug: "case-study",
    label: "Case Study",
    structures: ["background-problem-analysis-recommendation"],
    intake: [req("topic", "Topic"), opt("case", "Case/context"), req("style", "Referencing style")],
    builderSteps: ["background", "problem", "analysis", "options", "recommendation", "references"],
    reviewerChecks: [...BASE_REVIEWER_CHECKS, "evidence-for-recommendation"],
  },
  proposal: {
    slug: "proposal",
    label: "Research Proposal",
    structures: ["gap-method-plan"],
    intake: [req("topic", "Topic"), opt("objectives", "Objectives"), opt("population", "Population"), opt("location", "Location"), opt("method", "Methodology")],
    builderSteps: ["topic", "objectives-questions", "gap", "methodology", "work-plan", "references"],
    reviewerChecks: [...BASE_REVIEWER_CHECKS, "feasibility"],
  },
  presentation: {
    slug: "presentation",
    label: "Academic Presentation",
    structures: ["outline-slides-notes"],
    intake: [req("topic", "Topic"), opt("slides", "Slide count"), opt("audience", "Audience")],
    builderSteps: ["topic", "outline", "slides", "notes", "references"],
    reviewerChecks: ["structure-fits-work-type", "clarity-flow", "requirements-compliance"],
  },
};

export function getWorkType(slug: string): WorkTypeDef {
  const def = (WORK_TYPE_REGISTRY as Record<string, WorkTypeDef>)[slug];
  if (!def) throw new Error(`Unknown work type: ${slug}`);
  return def;
}

// Prisma WorkType enum (UPPER_SNAKE) → registry slug.
const ENUM_TO_SLUG: Record<string, WorkTypeSlug> = {
  PROJECT: "project",
  SEMINAR: "seminar",
  ASSIGNMENT: "assignment",
  TERM_PAPER: "term-paper",
  ESSAY: "essay",
  LIT_REVIEW: "lit-review",
  CASE_STUDY: "case-study",
  PROPOSAL: "proposal",
  PRESENTATION: "presentation",
};

export function workTypeLabel(enumValue: string): string {
  const slug = ENUM_TO_SLUG[enumValue];
  return slug ? WORK_TYPE_REGISTRY[slug].label : enumValue;
}
