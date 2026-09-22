"use client";

import { useCallback, useState } from "react";
import { apiClient } from "@/lib/api-client";

export function useDeleteRecord(tableName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const cleanTableName = tableName
    ? tableName.replace(/Collection$/i, "").toLowerCase()
    : "";

  const deleteRecord = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(undefined);

      try {
        const result = await apiClient.delete(
          `/tables/${cleanTableName}/${id}`,
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

  return { deleteRecord, loading, error };
}
