import { describe, expect, it } from "vitest";
import { runReview } from "./reviewer";

const BASE = {
  workTypeEnum: "SEMINAR",
  objectives: "Assess digital competencies among nurses",
  style: "APA 7",
  sources: [{ id: "s1", authors: "Theresa Adebayo", year: 2023 }],
  references: [{ id: "r1", sourceId: "s1" }],
};

describe("runReview", () => {
  it("scores empty work low with missing-section issues", () => {
    const report = runReview({ ...BASE, sections: [] });
    expect(report.score).toBeLessThan(65);
    expect(report.summary.high + report.summary.medium).toBeGreaterThan(0);
    expect(report.issues.some((i) => i.location === "evidence" || i.message.includes("Missing section"))).toBe(true);
  });
  it("scores complete, cited work high", () => {
    const report = runReview({
      ...BASE,
      objectives: "Assess digital competencies among nurses in clinical practice",
      sections: [
        { step: "topic", contentMd: "Digital competencies among nurses" },
        { step: "outline", contentMd: "Outline of digital competencies" },
        {
          step: "research",
          contentMd:
            "Adebayo (2023) found that digital competencies among nurses in clinical practice improve care. The study surveyed nurses on competencies.",
        },
        { step: "discussion", contentMd: "The discussion shows nurses need digital competencies in clinical practice per Adebayo (2023)." },
        { step: "conclusion", contentMd: "In conclusion, digital competencies among nurses in clinical practice matter (Adebayo, 2023)." },
        { step: "references", contentMd: "Adebayo, T. (2023). Digital competencies. Journal, 1, 1-2." },
      ],
    });
    expect(report.score).toBeGreaterThanOrEqual(80);
  });
  it("flags unsupported empirical claims", () => {
    const report = runReview({
      ...BASE,
      sections: [
        { step: "topic", contentMd: "T" },
        { step: "outline", contentMd: "O" },
        { step: "research", contentMd: "Studies show nurses improved by 40% overall in every ward today." },
        { step: "discussion", contentMd: "D" },
        { step: "conclusion", contentMd: "C" },
        { step: "references", contentMd: "R" },
      ],
    });
    expect(report.issues.some((i) => i.location === "evidence")).toBe(true);
  });
  it("flags duplicate sentences", () => {
    const dup = "Nurses need digital competencies for modern clinical practice every day.";
    const report = runReview({
      ...BASE,
      sections: [
        { step: "topic", contentMd: "T" },
        { step: "outline", contentMd: "O" },
        { step: "research", contentMd: `${dup} ${dup}` },
        { step: "discussion", contentMd: "D" },
        { step: "conclusion", contentMd: "C" },
        { step: "references", contentMd: "R" },
      ],
    });
    expect(report.issues.some((i) => i.message.includes("duplicate"))).toBe(true);
  });
});
