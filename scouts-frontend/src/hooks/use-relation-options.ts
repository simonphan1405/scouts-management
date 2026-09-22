"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

export interface RelationOption {
  id: string;
  name: string;
  value: string; // UUID / BigInt id
  label: string; // display name
}

/**
 * Lấy danh sách records từ bảng quan hệ từ scouts-backend
 * và trả về options { id, name, value, label } dùng cho combobox/select.
 */
export function useRelationOptions(collectionField: string | undefined): {
  options: RelationOption[];
  loading: boolean;
} {
  const [options, setOptions] = useState<RelationOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!collectionField) {
      setOptions([]);
      setLoading(false);
      return;
    }

    const tableName = collectionField.replace(/Collection$/i, "").toLowerCase();
    let isMounted = true;
    setLoading(true);

    apiClient
      .get<RelationOption[]>(`/tables/${tableName}/relations`)
      .then((data) => {
        if (isMounted) {
          setOptions(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn(`Lỗi lấy options quan hệ cho bảng ${tableName}:`, err);
        if (isMounted) {
          setOptions([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [collectionField]);

  return { options, loading };
}
