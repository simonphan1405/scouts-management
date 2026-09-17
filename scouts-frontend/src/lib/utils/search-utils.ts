import type { ColumnMeta } from "@/lib/graphql/types";

/**
 * Remove Vietnamese accents/diacritics and lowercase the string for flexible search.
 * e.g. "Nguyễn Văn Đạo" -> "nguyen van dao"
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

/**
 * Check if a row matches the global search query across all columns and resolved relation labels.
 */
export function matchesSearch(
  row: Record<string, unknown>,
  query: string,
  columns: ColumnMeta[],
  relationMaps: Record<string, Map<string, string>>,
): boolean {
  if (!query || query.trim() === "") return true;

  const normalizedQuery = removeVietnameseTones(query);
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

  // Collect all searchable text from this row
  const searchValues: string[] = [];

  for (const col of columns) {
    const rawValue = row[col.name];
    if (rawValue == null) continue;

    // Add raw string
    searchValues.push(String(rawValue));

    // If this is a foreign key, also add its resolved human-readable name
    const relMap = relationMaps[col.name];
    if (relMap) {
      const resolved = relMap.get(String(rawValue));
      if (resolved) {
        searchValues.push(resolved);
      }
    }
  }

  const combinedNormalized = removeVietnameseTones(searchValues.join(" "));

  // All query tokens must be found in the row's combined text
  return queryTokens.every((token) => combinedNormalized.includes(token));
}

export interface ActiveFilter {
  column: string;
  value: string;
}

/**
 * Check if a row satisfies all active column filters.
 */
export function matchesColumnFilters(
  row: Record<string, unknown>,
  filters: Record<string, string>,
): boolean {
  for (const [colName, expectedValue] of Object.entries(filters)) {
    if (!expectedValue || expectedValue === "") continue;

    const actualValue = row[colName];
    if (actualValue == null) {
      return false;
    }

    // Exact string match for selection filters
    if (String(actualValue) !== expectedValue) {
      return false;
    }
  }
  return true;
}
