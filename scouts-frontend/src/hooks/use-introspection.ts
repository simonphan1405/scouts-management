"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { TableMeta, ColumnMeta } from "@/lib/graphql/types";

export function useTableList(): {
  tables: TableMeta[];
  loading: boolean;
  error: Error | undefined;
} {
  const [tables, setTables] = useState<TableMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    apiClient
      .get<TableMeta[]>("/tables")
      .then((data) => {
        if (isMounted) {
          setTables(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { tables, loading, error };
}

export function useTableSchema(tableOrTypeName: string): {
  columns: ColumnMeta[];
  loading: boolean;
  error: Error | undefined;
} {
  const [columns, setColumns] = useState<ColumnMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (!tableOrTypeName) {
      setColumns([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const tableName = tableOrTypeName.replace(/Collection$/i, "").toLowerCase();

    apiClient
      .get<ColumnMeta[]>(`/tables/${tableName}/schema`)
      .then((data) => {
        if (isMounted) {
          // Lọc bỏ các cột kỹ thuật không cần thiết nếu có
          const cleanCols = data.filter(
            (c) => !["nodeId", "created_at", "updated_at"].includes(c.name),
          );
          setColumns(cleanCols);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [tableOrTypeName]);

  return { columns, loading, error };
}
