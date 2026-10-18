export const normalizeSearch = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase().trim();
export function searchRank(value: string, query: string): number {
  const text = normalizeSearch(value), q = normalizeSearch(query);
  if (!q || !text.includes(q)) return 0;
  if (text === q) return 4;
  if (text.startsWith(q)) return 3;
  if (text.split(/[^\p{L}\p{N}]+/u).some(word => word.startsWith(q))) return 2;
  return 1;
}
export interface SearchResult { id: string; label: string; detail?: string; link: string; group: string; terms: string[] }
export function rankSearch(results: SearchResult[], query: string): SearchResult[] {
  const count = new Map<string, number>();
  return results.map(result => ({ result, rank: Math.max(...result.terms.map(term => searchRank(term, query))) })).filter(item => item.rank > 0).sort((a, b) => b.rank - a.rank || a.result.label.localeCompare(b.result.label)).flatMap(({ result }) => { const size = count.get(result.group) ?? 0; count.set(result.group, size + 1); return size < 5 ? [result] : []; });
}
