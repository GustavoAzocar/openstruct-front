import { normalizeSearch } from './catalog-filters.ts';

export type ManualSearchSection = {
  systemId: string;
  systemName: string;
  editionId: string;
  editionTitle: string;
  appVersion: string | null;
  historical: boolean;
  chapterTitle: string;
  chapterStatus: 'sample' | 'published';
  href: string;
  sectionTitle: string;
  text: string;
  keywords: readonly string[];
};

export type ManualSearchResult = { section: ManualSearchSection; snippet: string };
type TextRange = { start: number; end: number };
type TextSegment = { text: string; match: boolean };

export const MANUAL_SEARCH_QUERY_LIMIT = 160;
export const MANUAL_SEARCH_RESULT_LIMIT = 30;
const SNIPPET_LENGTH = 180;

function queryTerms(query: string): string[] {
  const terms = normalizeSearch(query.trim().slice(0, MANUAL_SEARCH_QUERY_LIMIT)).match(
    /[\p{L}\p{N}]+/gu,
  );
  return [...new Set(terms)];
}

function scoreSection(section: ManualSearchSection, terms: string[]): number {
  const fields = [
    { value: normalizeSearch(section.sectionTitle), weight: 12 },
    { value: normalizeSearch(section.chapterTitle), weight: 8 },
    { value: normalizeSearch(section.keywords.join(' ')), weight: 5 },
    { value: normalizeSearch(section.systemName), weight: 3 },
    { value: normalizeSearch(section.text), weight: 1 },
  ];
  let score = 0;
  for (const term of terms) {
    const field = fields.find(({ value }) => value.includes(term));
    if (!field) return 0;
    score += field.weight;
  }
  return score;
}

/** Map normalized matches back to the original text, including decomposed accents. */
function sourceOffsets(text: string) {
  const starts: number[] = [];
  const ends: number[] = [];
  let start = 0;
  for (const cluster of text.matchAll(/\P{M}\p{M}*|\p{M}+/gu)) {
    const unit = cluster[0];
    const end = start + unit.length;
    const normalizedLength = normalizeSearch(unit).length;
    for (let i = 0; i < normalizedLength; i++) {
      starts.push(start);
      ends.push(end);
    }
    start = end;
  }
  return { starts, ends };
}

function codePointBoundary(text: string, index: number): number {
  const unit = text.charCodeAt(index);
  return unit >= 0xdc00 && unit <= 0xdfff ? index - 1 : index;
}

function snippetFor(source: string, terms: string[]): string {
  const text = source.replace(/\s+/gu, ' ').trim();
  if (text.length <= SNIPPET_LENGTH) return text;

  const normalized = normalizeSearch(text);
  let focus: TextRange | undefined;
  for (const term of terms) {
    const start = normalized.indexOf(term);
    if (start < 0) continue;
    const currentLength = focus ? focus.end - focus.start : 0;
    if (
      !focus ||
      term.length > currentLength ||
      (term.length === currentLength && start < focus.start)
    ) {
      focus = { start, end: start + term.length };
    }
  }

  let matchStart = 0;
  let matchEnd = 0;
  if (focus) {
    const { starts, ends } = sourceOffsets(text);
    matchStart = starts[focus.start];
    matchEnd = ends[focus.end - 1];
  }

  const leading = Math.max(0, Math.min(55, SNIPPET_LENGTH - (matchEnd - matchStart)));
  const windowStart = codePointBoundary(text, Math.max(0, matchStart - leading));
  const windowEnd = codePointBoundary(text, Math.min(text.length, windowStart + SNIPPET_LENGTH));
  const nextSpace = text.indexOf(' ', windowStart);
  const lastSpace = text.lastIndexOf(' ', windowEnd);
  const start =
    windowStart > 0 && nextSpace >= 0 && nextSpace < matchStart ? nextSpace + 1 : windowStart;
  const end =
    windowEnd < text.length && lastSpace >= matchEnd && lastSpace > start ? lastSpace : windowEnd;

  return `${start > 0 ? '… ' : ''}${text.slice(start, end).trim()}${end < text.length ? ' …' : ''}`;
}

export function searchManualSections(
  sections: readonly ManualSearchSection[],
  query: string,
): ManualSearchResult[] {
  const terms = queryTerms(query);
  if (!terms.length) return [];

  return sections
    .map((section) => ({ section, score: scoreSection(section, terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MANUAL_SEARCH_RESULT_LIMIT)
    .map(({ section }) => ({ section, snippet: snippetFor(section.text, terms) }));
}

export function highlightManualText(text: string, query: string): TextSegment[] {
  if (!text) return [];
  const normalized = normalizeSearch(text);
  const hits: TextRange[] = [];
  for (const term of queryTerms(query)) {
    for (
      let start = normalized.indexOf(term);
      start !== -1;
      start = normalized.indexOf(term, start + 1)
    ) {
      hits.push({ start, end: start + term.length });
    }
  }
  if (!hits.length) return [{ text, match: false }];

  const { starts, ends } = sourceOffsets(text);
  const merged: TextRange[] = [];
  hits.sort((a, b) => a.start - b.start);
  for (const hit of hits) {
    const start = starts[hit.start];
    const end = ends[hit.end - 1];
    const previous = merged.at(-1);
    if (previous && start <= previous.end) previous.end = Math.max(previous.end, end);
    else merged.push({ start, end });
  }

  const segments: TextSegment[] = [];
  let cursor = 0;
  for (const { start, end } of merged) {
    if (cursor < start) segments.push({ text: text.slice(cursor, start), match: false });
    segments.push({ text: text.slice(start, end), match: true });
    cursor = end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), match: false });
  return segments;
}
