// Evidence engine — PRD §6. Crossref + OpenAlex, year range, NG/Africa boost.
// No API keys required. Never invents sources: everything returned came from an API.

export interface FoundSource {
  authors: string | null;
  year: number | null;
  title: string;
  journal: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  doi: string | null;
  url: string | null;
  origin: "crossref" | "openalex";
  africanRelevant: boolean;
}

export interface ResearchOptions {
  query: string;
  yearFrom?: number;
  yearTo?: number;
  boostAfrican?: boolean;
  limit?: number;
}

const AFRICAN_HINT = /(nigeria|nigerian|africa|african|ghana|kenya|ethiopia|south africa|uganda|tanzania|cameroon)/i;

function textOf(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function yearOf(dateParts: unknown, year: unknown): number | null {
  if (typeof year === "number" && year > 1500 && year < 2100) return year;
  if (Array.isArray(dateParts) && Array.isArray(dateParts[0])) {
    const y = dateParts[0][0];
    if (typeof y === "number") return y;
  }
  return null;
}

interface CrossrefItem {
  author?: Array<{ given?: string; family?: string }>;
  published?: { "date-parts"?: unknown };
  "published-print"?: { "date-parts"?: unknown };
  "published-online"?: { "date-parts"?: unknown };
  title?: string[];
  "container-title"?: string[];
  volume?: string;
  issue?: string;
  page?: string;
  DOI?: string;
  URL?: string;
}

function fromCrossref(item: CrossrefItem): FoundSource {
  const authors =
    item.author
      ?.map((a) => [a.given, a.family].filter(Boolean).join(" "))
      .filter(Boolean)
      .join(", ") || null;
  const year =
    yearOf(item.published?.["date-parts"], undefined) ??
    yearOf(item["published-print"]?.["date-parts"], undefined) ??
    yearOf(item["published-online"]?.["date-parts"], undefined);
  const title = item.title?.[0] ?? "Untitled";
  const journal = item["container-title"]?.[0] ?? null;
  return {
    authors,
    year,
    title,
    journal,
    volume: item.volume ?? null,
    issue: item.issue ?? null,
    pages: item.page ?? null,
    doi: item.DOI ?? null,
    url: item.URL ?? (item.DOI ? `https://doi.org/${item.DOI}` : null),
    origin: "crossref",
    africanRelevant: AFRICAN_HINT.test(`${title} ${journal ?? ""}`),
  };
}

interface OpenAlexAuthorship {
  author?: { display_name?: string };
  institutions?: Array<{ country_code?: string }>;
}

interface OpenAlexItem {
  display_name?: string;
  publication_year?: number;
  primary_location?: { source?: { display_name?: string } };
  biblio?: { volume?: string; issue?: string; first_page?: string; last_page?: string };
  doi?: string | null;
  id?: string;
  authorships?: OpenAlexAuthorship[];
  title?: string;
}

function fromOpenAlex(item: OpenAlexItem): FoundSource {
  const authors =
    item.authorships
      ?.map((a) => a.author?.display_name)
      .filter((n): n is string => !!n)
      .join(", ") || null;
  const ng = (item.authorships ?? []).some((a) =>
    (a.institutions ?? []).some((i) => i.country_code === "NG"),
  );
  const first = item.biblio?.first_page;
  const last = item.biblio?.last_page;
  return {
    authors,
    year: item.publication_year ?? null,
    title: item.display_name ?? item.title ?? "Untitled",
    journal: item.primary_location?.source?.display_name ?? null,
    volume: item.biblio?.volume ?? null,
    issue: item.biblio?.issue ?? null,
    pages: first && last ? `${first}–${last}` : (first ?? null),
    doi: item.doi ? item.doi.replace(/^https?:\/\/doi\.org\//, "") : null,
    url: item.doi ?? item.id ?? null,
    origin: "openalex",
    africanRelevant:
      ng || AFRICAN_HINT.test(`${item.display_name ?? ""}`),
  };
}

function inRange(s: FoundSource, from?: number, to?: number): boolean {
  if (s.year == null) return true;
  if (from && s.year < from) return false;
  if (to && s.year > to) return false;
  return true;
}

function dedupe(sources: FoundSource[]): FoundSource[] {
  const seen = new Set<string>();
  return sources.filter((s) => {
    const key = (s.doi ?? "").toLowerCase() || s.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function runResearch(opts: ResearchOptions): Promise<FoundSource[]> {
  const limit = Math.min(Math.max(opts.limit ?? 20, 5), 50);
  const q = encodeURIComponent(opts.query);
  const mailto = process.env.CROSSREF_MAILTO ?? "assignme@example.com";

  let crossrefFilter = "";
  if (opts.yearFrom) crossrefFilter += `,from-pub-date:${opts.yearFrom}-01-01`;
  if (opts.yearTo) crossrefFilter += `,until-pub-date:${opts.yearTo}-12-31`;

  let oaFilter = "";
  if (opts.yearFrom || opts.yearTo) {
    const from = opts.yearFrom ? `${opts.yearFrom}-01-01` : "1500-01-01";
    const to = opts.yearTo ? `${opts.yearTo}-12-31` : "2100-12-31";
    oaFilter = `&filter=from_publication_date:${from},to_publication_date:${to}`;
  }

  const [cr, oa] = await Promise.all([
    fetch(
      `https://api.crossref.org/works?query=${q}&rows=${limit}&select=author,published,published-print,published-online,title,container-title,volume,issue,page,DOI,URL${crossrefFilter}&mailto=${mailto}`,
      { headers: { Accept: "application/json" } },
    )
      .then((r) => (r.ok ? r.json() : { message: { items: [] } }))
      .catch(() => ({ message: { items: [] } })),
    fetch(`https://api.openalex.org/works?search=${q}&per-page=${limit}${oaFilter}`)
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .catch(() => ({ results: [] })),
  ]);

  const crItems = ((cr.message?.items ?? []) as CrossrefItem[]).map(fromCrossref);
  const oaItems = ((oa.results ?? []) as OpenAlexItem[]).map(fromOpenAlex);
  let all = dedupe([...crItems, ...oaItems]).filter((s) =>
    inRange(s, opts.yearFrom, opts.yearTo),
  );
  if (opts.boostAfrican !== false)
    all = [...all.filter((s) => s.africanRelevant), ...all.filter((s) => !s.africanRelevant)];
  return all.slice(0, limit);
}

export function verificationOf(s: FoundSource): "VERIFIED" | "NEEDS_CHECK" {
  // Crossref records carry publisher-deposited metadata incl. DOI → verified.
  // OpenAlex-only records without DOI need a human check.
  if (s.origin === "crossref" && s.doi) return "VERIFIED";
  if (s.doi) return "VERIFIED";
  return "NEEDS_CHECK";
}

export { textOf };
