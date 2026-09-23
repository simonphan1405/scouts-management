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

/**
 * Danh sách các cột bị loại trừ theo bảng (cột không có trong DB hoặc không cần thiết hiển thị ở UI)
 */
const TABLE_EXCLUDED_COLUMNS: Record<string, string[]> = {
  groups: ["council"], // Liên đoàn trực thuộc Đạo (district), không có quan hệ trực tiếp tới Châu (council)
};

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
          const excludedForTable = TABLE_EXCLUDED_COLUMNS[tableName] || [];
          // Lọc bỏ các cột kỹ thuật không cần thiết và các cột ngoại lai theo từng bảng
          const cleanCols = data.filter(
            (c) =>
              !["nodeId", "created_at", "updated_at", "__typename"].includes(
                c.name,
              ) && !excludedForTable.includes(c.name),
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
