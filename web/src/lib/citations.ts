// Citation engine — PRD §7. Deterministic formatters + consistency checks.
// Styles: APA 7, MLA, Harvard, Chicago (author-date), Vancouver, IEEE.

export const CITATION_STYLES = ["APA 7", "MLA", "Harvard", "Chicago", "Vancouver", "IEEE"] as const;
export type CitationStyle = (typeof CITATION_STYLES)[number];

export interface CitableSource {
  authors: string | null; // "Given Family, Given Family, ..."
  year: number | null;
  title: string;
  journal: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  doi: string | null;
  url: string | null;
}

interface Author {
  given: string[];
  family: string;
}

export function parseAuthors(authors: string | null): Author[] {
  if (!authors) return [];
  return authors
    .split(/\s*,\s*|\s+and\s+|\s*&\s*/)
    .map((n) => n.trim())
    .filter(Boolean)
    .map((n) => {
      const parts = n.split(/\s+/);
      return { given: parts.slice(0, -1), family: parts[parts.length - 1] };
    });
}

const initials = (given: string[]) =>
  given.map((g) => `${g.replace(".", "")[0] ?? ""}.`).join(" ");

function sentenceCase(t: string): string {
  const s = t.trim();
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function joinAuthors(list: Author[], fmt: (a: Author) => string, lastSep: string): string {
  if (list.length === 0) return "";
  if (list.length === 1) return fmt(list[0]);
  return `${list.slice(0, -1).map(fmt).join(", ")}${lastSep}${fmt(list[list.length - 1])}`;
}

function doiUrl(s: CitableSource): string {
  if (s.doi) return s.doi.startsWith("http") ? s.doi : `https://doi.org/${s.doi}`;
  return s.url ?? "";
}

function volIssue(s: CitableSource): string {
  if (s.volume && s.issue) return `${s.volume}(${s.issue})`;
  return s.volume ?? "";
}

export function formatInText(s: CitableSource, style: CitationStyle): string {
  const authors = parseAuthors(s.authors);
  const year = s.year ? String(s.year) : "n.d.";
  const first = authors[0]?.family ?? "Anon.";
  const etal = authors.length > 2 ? " et al." : authors.length === 2 ? ` & ${authors[1].family}` : "";
  switch (style) {
    case "APA 7":
      return `(${first}${etal}, ${year})`;
    case "MLA":
      return authors.length > 2 ? `(${first} et al.)` : `(${authors.map((a) => a.family).join(" and ") || "Anon."})`;
    case "Harvard":
      return `(${first}${etal} ${year})`;
    case "Chicago":
      return `(${first}${etal} ${year})`;
    case "Vancouver":
      return `[ref]`;
    case "IEEE":
      return `[ref]`;
  }
}

export function formatReference(s: CitableSource, style: CitationStyle): string {
  const authors = parseAuthors(s.authors);
  const year = s.year ? String(s.year) : "n.d.";
  const title = sentenceCase(s.title.replace(/\.$/, ""));
  const journal = s.journal ?? "n.p.";
  const vi = volIssue(s);
  const pages = s.pages ? (style === "APA 7" || style === "Harvard" ? `${s.pages}` : s.pages) : "";
  const doi = doiUrl(s);

  switch (style) {
    case "APA 7": {
      const au = joinAuthors(authors, (a) => `${a.family}, ${initials(a.given)}`, " & ") || "Anonymous";
      return `${au} (${year}). ${title}. *${journal}*${vi ? `, *${vi}*` : ""}${pages ? `, ${pages}` : ""}. ${doi}`.trim();
    }
    case "MLA": {
      const au =
        authors.length > 2
          ? `${authors[0].given.join(" ")} ${authors[0].family}, et al`
          : authors.map((a) => `${a.given.join(" ")} ${a.family}`).join(", ") || "Anonymous";
      return `${au}. "${sentenceCase(s.title)}." *${journal}*, vol. ${s.volume ?? "n"}, no. ${s.issue ?? "n"}, ${year}${pages ? `, pp. ${pages}` : ""}.`.trim();
    }
    case "Harvard": {
      const au = joinAuthors(authors, (a) => `${a.family}, ${initials(a.given)}`.trimEnd(), " and ") || "Anonymous";
      return `${au} (${year}) '${title}', *${journal}*${vi ? `, ${vi}` : ""}${pages ? `, pp. ${pages}` : ""}.`.trim();
    }
    case "Chicago": {
      const au = joinAuthors(authors, (a) => `${a.family}, ${a.given.join(" ")}`, " and ") || "Anonymous";
      return `${au}. ${year}. "${sentenceCase(s.title)}." *${journal}* ${vi}${pages ? ` (${pages})` : ""}. ${doi}`.trim();
    }
    case "Vancouver": {
      const au = authors.map((a) => `${a.family} ${a.given.map((g) => (g[0] ?? "").toUpperCase()).join("")}`).join(", ") || "Anonymous";
      return `${au}. ${title}. ${journal}. ${year}${vi ? `;${vi}` : ""}${pages ? `:${pages}` : ""}. ${doi}`.trim();
    }
    case "IEEE": {
      const au = authors.map((a) => `${a.given.map((g) => `${(g[0] ?? "").toUpperCase()}.`).join(" ")} ${a.family}`).join(", ") || "Anonymous";
      return `${au}, "${sentenceCase(s.title)}," *${journal}*, vol. ${s.volume ?? "x"}, no. ${s.issue ?? "x"}${pages ? `, pp. ${pages}` : ""}, ${year}. ${doi}`.trim();
    }
  }
}

export interface ConsistencyIssue {
  referenceId: string;
  message: string;
}

/** Loose check: every reference's first-author surname + year should appear in the draft text. */
export function checkConsistency(
  sectionsText: string,
  refs: Array<{ id: string; authors: string | null; year: number | null }>,
): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];
  const text = sectionsText.toLowerCase();
  for (const r of refs) {
    const surname = parseAuthors(r.authors)[0]?.family.toLowerCase();
    if (surname && !text.includes(surname)) {
      issues.push({ referenceId: r.id, message: `First author "${parseAuthors(r.authors)[0].family}" is never cited in the text.` });
      continue;
    }
    if (r.year && !text.includes(String(r.year))) {
      issues.push({ referenceId: r.id, message: `Year ${r.year} never appears in the text — check the in-text citation.` });
    }
  }
  return issues;
}

