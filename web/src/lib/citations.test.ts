import { describe, expect, it } from "vitest";
import {
  CITATION_STYLES,
  checkConsistency,
  formatInText,
  formatReference,
  parseAuthors,
} from "./citations";

const SRC = {
  authors: "Theresa Adebayo, John Okoro",
  year: 2023,
  title: "Digital competencies among nurses.",
  journal: "Journal of Nursing Studies",
  volume: "12",
  issue: "3",
  pages: "45–60",
  doi: "10.1234/example",
  url: null,
};

describe("parseAuthors", () => {
  it("splits given/family names", () => {
    expect(parseAuthors(SRC.authors)).toEqual([
      { given: ["Theresa"], family: "Adebayo" },
      { given: ["John"], family: "Okoro" },
    ]);
  });
  it("handles null", () => {
    expect(parseAuthors(null)).toEqual([]);
  });
});

describe("formatReference", () => {
  it("covers all six styles without throwing", () => {
    for (const style of CITATION_STYLES) {
      const ref = formatReference(SRC, style);
      expect(ref).toContain("2023");
      expect(ref.length).toBeGreaterThan(20);
    }
  });
  it("APA 7 includes DOI url and ampersand", () => {
    const ref = formatReference(SRC, "APA 7");
    expect(ref).toContain("https://doi.org/10.1234/example");
    expect(ref).toContain("&");
    expect(ref).toContain("(2023)");
  });
  it("handles missing authors/year gracefully", () => {
    const ref = formatReference({ ...SRC, authors: null, year: null }, "APA 7");
    expect(ref).toContain("Anonymous");
    expect(ref).toContain("n.d.");
  });
});

describe("formatInText", () => {
  it("APA uses surname + year", () => {
    expect(formatInText(SRC, "APA 7")).toBe("(Adebayo & Okoro, 2023)");
  });
  it("three authors use et al.", () => {
    const three = { ...SRC, authors: "A One, B Two, C Three" };
    expect(formatInText(three, "APA 7")).toBe("(One et al., 2023)");
  });
});

describe("checkConsistency", () => {
  const refs = [{ id: "r1", authors: SRC.authors, year: 2023 }];
  it("passes when cited", () => {
    expect(checkConsistency("As Adebayo (2023) shows…", refs)).toEqual([]);
  });
  it("flags uncited authors", () => {
    const issues = checkConsistency("Unrelated text.", refs);
    expect(issues).toHaveLength(1);
    expect(issues[0].referenceId).toBe("r1");
  });
});
