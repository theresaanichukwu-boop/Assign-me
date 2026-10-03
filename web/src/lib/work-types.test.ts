import { describe, expect, it } from "vitest";
import {
  WORK_TYPES,
  WORK_TYPE_REGISTRY,
  getWorkType,
  workTypeLabel,
  workTypeSlugFromEnum,
} from "./work-types";

describe("work-type registry", () => {
  it("has exactly nine work types", () => {
    expect(WORK_TYPES).toHaveLength(9);
  });
  it("every type has steps, intake, and reviewer checks", () => {
    for (const slug of WORK_TYPES) {
      const def = getWorkType(slug);
      expect(def.builderSteps.length).toBeGreaterThan(2);
      expect(def.intake.length).toBeGreaterThan(0);
      expect(def.reviewerChecks).toContain("citation-reference-consistency");
    }
  });
  it("no type defaults to bare chapters 1-5 except project", () => {
    for (const slug of WORK_TYPES) {
      if (slug === "project") continue;
      expect(
        WORK_TYPE_REGISTRY[slug].structures.some((s) => s === "chapters-1-5"),
      ).toBe(false);
    }
  });
  it("throws on unknown slug", () => {
    expect(() => getWorkType("thesis")).toThrow();
  });
  it("maps Prisma enums to labels", () => {
    expect(workTypeSlugFromEnum("LIT_REVIEW")).toBe("lit-review");
    expect(workTypeLabel("SEMINAR")).toBe("Seminar");
  });
});
