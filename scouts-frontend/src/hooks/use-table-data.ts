"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { ColumnMeta } from "@/lib/graphql/types";

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

type Row = Record<string, unknown>;

export function useTableData(
  collectionField: string,
  columns: ColumnMeta[],
  fetchLimit: number = 1000,
) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  const tableName = collectionField
    ? collectionField.replace(/Collection$/i, "").toLowerCase()
    : "";

  const fetchData = useCallback(async () => {
    if (!tableName) {
      setRows([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const res = await apiClient.get<{ rows: Row[]; total: number }>(
        `/tables/${tableName}`,
        {
          params: { limit: fetchLimit },
        },
      );
      setRows(res.rows || []);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [tableName, fetchLimit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pageInfo = {
    hasNextPage: false,
    endCursor: null,
  };

  return {
    rows,
    loading,
    error,
    refetch: fetchData,
    pageInfo,
  };
}
