import { describe, expect, it } from "vitest";
import { DISCIPLINE_PACKS, buildSectionPrompt, packForCourse } from "./prompts";

describe("packForCourse", () => {
  it("selects nursing for nursing courses", () => {
    expect(packForCourse("Nursing")).toBe(DISCIPLINE_PACKS.nursing);
    expect(packForCourse("BSc Nursing Science")).toBe(DISCIPLINE_PACKS.nursing);
  });
  it("falls back to general", () => {
    expect(packForCourse("Law")).toBe(DISCIPLINE_PACKS.general);
    expect(packForCourse(null)).toBe(DISCIPLINE_PACKS.general);
  });
});

describe("buildSectionPrompt", () => {
  it("merges discipline, work type, and memory", () => {
    const messages = buildSectionPrompt(DISCIPLINE_PACKS.nursing, {
      workTypeLabel: "Seminar",
      step: "discussion",
      topic: "Digital competencies",
      objectives: ["Assess skills"],
      priorSteps: [{ step: "topic", contentMd: "Chosen topic text" }],
      citationStyle: "APA 7",
      level: "Final Year",
    });
    const all = messages.map((m) => m.content).join("\n");
    expect(all).toContain("Nursing");
    expect(all).toContain("Seminar");
    expect(all).toContain("discussion");
    expect(all).toContain("Digital competencies");
    expect(all).toContain("NEVER invent references");
  });
  it("handles empty memory gracefully", () => {
    const messages = buildSectionPrompt(DISCIPLINE_PACKS.general, {
      workTypeLabel: "Essay",
      step: "thesis",
      topic: null,
      objectives: null,
      priorSteps: [],
      citationStyle: "MLA",
      level: null,
    });
    expect(messages).toHaveLength(2);
    expect(messages[1].content).toContain("thesis");
  });
  it("encodes supervisor rules, not decoration", () => {
    const [system] = buildSectionPrompt(DISCIPLINE_PACKS.nursing, {
      workTypeLabel: "Proposal",
      step: "methodology",
      topic: "X",
      objectives: ["Y"],
      priorSteps: [],
      citationStyle: "APA 7",
      level: "Final Year",
    });
    for (const rule of [
      "Do NOT blindly agree",
      "NEVER invent references",
      "verification needed",
      "clarification questions",
      "variables",
      "population",
    ]) {
      expect(system.content).toContain(rule);
    }
  });
});
