"use client";

import { useCallback, useMemo } from "react";
import { useMutation } from "@apollo/client/react";
import { buildUpdateMutation } from "@/lib/graphql/query-builder";
import type { ColumnMeta } from "@/lib/graphql/types";

export function useUpdateRecord(tableName: string, columns: ColumnMeta[]) {
  const columnKey = columns.map((c) => c.name).join(",");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mutation = useMemo(() => buildUpdateMutation(tableName, columns), [tableName, columnKey]);
  const [mutate, { loading, error }] = useMutation(mutation);

  const updateRecord = useCallback(
    (id: string, values: Record<string, unknown>) =>
      mutate({ variables: { id, ...values } }),
    [mutate],
  );

  return { updateRecord, loading, error };
}

