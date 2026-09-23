"use client";

import { useCallback, useState } from "react";
import { apiClient } from "@/lib/api-client";

export function useUpdateRecord(tableName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const cleanTableName = tableName
    ? tableName.replace(/Collection$/i, "").toLowerCase()
    : "";

  const updateRecord = useCallback(
    async (id: string, values: Record<string, unknown>) => {
      setLoading(true);
      setError(undefined);

      try {
        const result = await apiClient.put(
          `/tables/${cleanTableName}/${id}`,
          values,
        );
        return result;
      } catch (err: unknown) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        throw errorObj;
      } finally {
        setLoading(false);
      }
    },
    [cleanTableName],
  );

  return { updateRecord, loading, error };
}
