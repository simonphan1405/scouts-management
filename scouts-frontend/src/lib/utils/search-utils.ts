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
    if (Array.isArray(rawValue)) {
      searchValues.push(rawValue.join(", "));
    } else if (
      typeof rawValue === "string" &&
      col.name === "previous_sections"
    ) {
      searchValues.push(
        rawValue
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .join(", "),
      );
    } else {
      searchValues.push(String(rawValue));
    }

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
 * Supports exact match, case-insensitive match, and Foreign Key ID <-> Name bidirectional resolution.
 */
export function matchesColumnFilters(
  row: Record<string, unknown>,
  filters: Record<string, string>,
  relationMaps?: Record<string, Map<string, string>>,
): boolean {
  for (const [colName, expectedValue] of Object.entries(filters)) {
    if (!expectedValue || expectedValue === "") continue;

    const actualValue = row[colName];
    if (actualValue == null) {
      return false;
    }

    if (Array.isArray(actualValue)) {
      const formatted = actualValue.join(", ");
      if (formatted.toLowerCase() === expectedValue.trim().toLowerCase()) {
        continue;
      }
      if (
        actualValue.some(
          (v) =>
            String(v).trim().toLowerCase() ===
            expectedValue.trim().toLowerCase(),
        )
      ) {
        continue;
      }
    }

    const actualStr = String(actualValue).trim();
    const expectedStr = expectedValue.trim();

    // 1. Direct match (case-insensitive)
    if (actualStr.toLowerCase() === expectedStr.toLowerCase()) {
      continue;
    }

    // 2. Relation map lookup (supports actual=ID, expected=Name OR actual=Name, expected=ID)
    const relMap = relationMaps?.[colName];
    if (relMap) {
      // actual is ID, expected is label (e.g. actual="4", expected="Voi")
      const resolvedFromActual = relMap.get(actualStr);
      if (
        resolvedFromActual &&
        resolvedFromActual.toLowerCase() === expectedStr.toLowerCase()
      ) {
        continue;
      }

      // expected is ID, actual is label (e.g. actual="Voi", expected="4")
      const resolvedFromExpected = relMap.get(expectedStr);
      if (
        resolvedFromExpected &&
        resolvedFromExpected.toLowerCase() === actualStr.toLowerCase()
      ) {
        continue;
      }

      // Any ID/Label pair match
      let matchedByPair = false;
      for (const [id, label] of relMap.entries()) {
        if (
          (id === actualStr &&
            label.toLowerCase() === expectedStr.toLowerCase()) ||
          (id === expectedStr &&
            label.toLowerCase() === actualStr.toLowerCase())
        ) {
          matchedByPair = true;
          break;
        }
      }
      if (matchedByPair) {
        continue;
      }
    }

    return false;
  }
  return true;
}
