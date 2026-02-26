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
    (values: Record<string, unknown>) => mutate({ variables: values }),
    [mutate],
  );

  return { createRecord, loading, error };
}
