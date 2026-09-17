"use client";

import { useMemo } from "react";
import { useRelationOptions } from "./use-relation-options";
import type { ColumnMeta } from "@/lib/graphql/types";

/**
 * For each FK column in `columns`, fetch relation options and build a lookup map:
 * { [columnName]: Map<idOrName, label> }
 *
 * This lets the data table display human-readable names instead of raw UUIDs/IDs,
 * and allows filtering by either ID or Label.
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

  // Support up to 10 FK columns by calling hooks at top level
  const col0 = fkColumns[0];
  const col1 = fkColumns[1];
  const col2 = fkColumns[2];
  const col3 = fkColumns[3];
  const col4 = fkColumns[4];
  const col5 = fkColumns[5];
  const col6 = fkColumns[6];
  const col7 = fkColumns[7];
  const col8 = fkColumns[8];
  const col9 = fkColumns[9];

  const rel0 = useRelationOptions(col0?.relationTo);
  const rel1 = useRelationOptions(col1?.relationTo);
  const rel2 = useRelationOptions(col2?.relationTo);
  const rel3 = useRelationOptions(col3?.relationTo);
  const rel4 = useRelationOptions(col4?.relationTo);
  const rel5 = useRelationOptions(col5?.relationTo);
  const rel6 = useRelationOptions(col6?.relationTo);
  const rel7 = useRelationOptions(col7?.relationTo);
  const rel8 = useRelationOptions(col8?.relationTo);
  const rel9 = useRelationOptions(col9?.relationTo);

  const loading =
    (!!col0 && rel0.loading) ||
    (!!col1 && rel1.loading) ||
    (!!col2 && rel2.loading) ||
    (!!col3 && rel3.loading) ||
    (!!col4 && rel4.loading) ||
    (!!col5 && rel5.loading) ||
    (!!col6 && rel6.loading) ||
    (!!col7 && rel7.loading) ||
    (!!col8 && rel8.loading) ||
    (!!col9 && rel9.loading);

  const relationMaps = useMemo(() => {
    const result: Record<string, Map<string, string>> = {};
    const pairs = [
      [col0, rel0] as const,
      [col1, rel1] as const,
      [col2, rel2] as const,
      [col3, rel3] as const,
      [col4, rel4] as const,
      [col5, rel5] as const,
      [col6, rel6] as const,
      [col7, rel7] as const,
      [col8, rel8] as const,
      [col9, rel9] as const,
    ];

    for (const [col, rel] of pairs) {
      if (!col) continue;
      const map = new Map<string, string>();
      for (const opt of rel.options) {
        map.set(opt.value, opt.label);
        map.set(opt.label, opt.label);
      }
      result[col.name] = map;
    }
    return result;
  }, [
    col0,
    col1,
    col2,
    col3,
    col4,
    col5,
    col6,
    col7,
    col8,
    col9,
    rel0,
    rel1,
    rel2,
    rel3,
    rel4,
    rel5,
    rel6,
    rel7,
    rel8,
    rel9,
  ]);

  return { relationMaps, loading };
}
