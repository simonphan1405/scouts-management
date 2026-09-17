"use client";

import { useCallback, useMemo } from "react";
import { useMutation } from "@apollo/client/react";
import { buildInsertMutation } from "@/lib/graphql/query-builder";
import type { ColumnMeta } from "@/lib/graphql/types";

export function useCreateRecord(tableName: string, columns: ColumnMeta[]) {
  const columnKey = columns.map((c) => c.name).join(",");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mutation = useMemo(() => buildInsertMutation(tableName, columns), [tableName, columnKey]);
  const [mutate, { loading, error }] = useMutation(mutation);

  const createRecord = useCallback(
    (values: Record<string, unknown>) => {
      const writableColumns = columns.filter(
        (c) => !["nodeId", "id", "created_at", "updated_at"].includes(c.name),
      );

      const cleanValues: Record<string, unknown> = {};
      for (const col of writableColumns) {
        if (values[col.name] !== undefined) {
          let val = values[col.name];
          if ((col.type === "BigInt" || col.type === "Int") && val !== null && val !== "") {
            val = !isNaN(Number(val)) ? Number(val) : val;
          } else if (val === "" && col.nullable) {
            val = null;
          }
          cleanValues[col.name] = val;
        }
      }

      return mutate({ variables: cleanValues });
    },
    [mutate, columns],
  );

  return { createRecord, loading, error };
}
