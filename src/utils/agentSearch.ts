export interface SearchableAgentItem {
  title: string;
  description: string;
  tags: string[];
}

const DEFAULT_LIMIT = 5;
const MIN_LIMIT = 1;
const MAX_LIMIT = 20;

export function searchAgentItems<TItem extends SearchableAgentItem>(
  items: TItem[],
  query: string,
  limit = DEFAULT_LIMIT
): TItem[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const safeLimit = clampLimit(limit);

  return items
    .filter((item) =>
      [item.title, item.description, ...item.tags].some((value) =>
        value.toLocaleLowerCase().includes(normalizedQuery)
      )
    )
    .slice(0, safeLimit);
}

export function clampLimit(limit: number): number {
  if (!Number.isFinite(limit)) {
    return DEFAULT_LIMIT;
  }

  return Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, Math.floor(limit)));
}
