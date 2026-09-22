"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { SectionLiveStats } from "@/components/cms/dashboard/sections-grid";

export interface DashboardOverviewData {
  memberCount: number;
  sectionCount: number;
  unitCounts: {
    councils: number;
    districts: number;
    groups: number;
    troops: number;
    units: number;
  };
  expenseTotal: number;
  sectionStats: Record<string, SectionLiveStats>;
  tableCounts: Record<string, number>;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<DashboardOverviewData>(
        "/dashboard/overview",
      );
      setData(res);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
