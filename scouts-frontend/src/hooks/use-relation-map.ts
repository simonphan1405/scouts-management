"use client";

import { useMemo } from "react";
import { useRelationOptions } from "./use-relation-options";
import type { ColumnMeta } from "@/lib/graphql/types";

/**
 * For each FK column in `columns`, fetch relation options and build a lookup map:
 * { [columnName]: Map<id, label> }
 *
 * This lets the data table display human-readable names instead of raw UUIDs/IDs.
 */
export function useRelationMap(columns: ColumnMeta[]): {
  relationMaps: Record<string, Map<string, string>>;
  loading: boolean;
} {
  // Collect distinct FK columns (columns that have a relationTo)
  const fkColumns = useMemo(
    () => columns.filter((c) => !!c.relationTo),
    [columns],
  );

  // We need to call hooks for each FK column. Since hooks can't be called
  // conditionally or in a loop, we support up to a fixed number of FK columns
  // by calling the hook for each slot and passing undefined when not needed.
  const col0 = fkColumns[0];
  const col1 = fkColumns[1];
  const col2 = fkColumns[2];
  const col3 = fkColumns[3];
  const col4 = fkColumns[4];

  const rel0 = useRelationOptions(col0?.relationTo);
  const rel1 = useRelationOptions(col1?.relationTo);
  const rel2 = useRelationOptions(col2?.relationTo);
  const rel3 = useRelationOptions(col3?.relationTo);
  const rel4 = useRelationOptions(col4?.relationTo);

  const loading =
    (!!col0 && rel0.loading) ||
    (!!col1 && rel1.loading) ||
    (!!col2 && rel2.loading) ||
    (!!col3 && rel3.loading) ||
    (!!col4 && rel4.loading);

  const relationMaps = useMemo(() => {
    const result: Record<string, Map<string, string>> = {};
    const pairs = [
      [col0, rel0] as const,
      [col1, rel1] as const,
      [col2, rel2] as const,
      [col3, rel3] as const,
      [col4, rel4] as const,
    ];
    for (const [col, rel] of pairs) {
      if (!col) continue;
      const map = new Map<string, string>();
      for (const opt of rel.options) {
        map.set(opt.value, opt.label);
      }
      result[col.name] = map;
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    col0,
    col1,
    col2,
    col3,
    col4,
    rel0.options,
    rel1.options,
    rel2.options,
    rel3.options,
    rel4.options,
  ]);

  return { relationMaps, loading };
}
