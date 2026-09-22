"use client";

import { useCallback, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { ColumnMeta } from "@/lib/graphql/types";

export function useCreateRecord(tableName: string, columns: ColumnMeta[]) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const cleanTableName = tableName
    ? tableName.replace(/Collection$/i, "").toLowerCase()
    : "";

  const createRecord = useCallback(
    async (values: Record<string, unknown>) => {
      setLoading(true);
      setError(undefined);

      try {
        const result = await apiClient.post(
          `/tables/${cleanTableName}`,
          values,
        );
        return result;
      } catch (err: any) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        throw errorObj;
      } finally {
        setLoading(false);
      }
    },
    [cleanTableName],
  );

  return { createRecord, loading, error };
}
