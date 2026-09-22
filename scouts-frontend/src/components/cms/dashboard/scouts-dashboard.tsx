"use client";

import { DashboardHero } from "./dashboard-hero";
import { KpiStats } from "./kpi-stats";
import { SectionsGrid } from "./sections-grid";
import { OrgHierarchyCard } from "./org-hierarchy-card";
import { QuickActions } from "./quick-actions";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export function ScoutsDashboard() {
  const { data, loading } = useDashboardData();

  const memberCount = data?.memberCount ?? 0;
  const sectionCount = data?.sectionCount ?? 0;
  const unitCounts = data?.unitCounts ?? {
    councils: 0,
    districts: 0,
    groups: 0,
    troops: 0,
    units: 0,
  };
  const expenseTotal = data?.expenseTotal ?? 0;
  const sectionStats = data?.sectionStats ?? {};
  const tableCounts = data?.tableCounts ?? {};

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">
      {/* Hero Welcome Banner with Reference Color Pattern */}
      <DashboardHero />

      {/* 4 Main KPI Cards with Real Database Counts */}
      <KpiStats
        loading={loading}
        memberCount={memberCount}
        sectionCount={sectionCount}
        unitCounts={unitCounts}
        expenseTotal={expenseTotal}
      />

      {/* 5 Scout Sections Grid with Live Section Counts & Database Rankings */}
      <SectionsGrid
        loading={loading}
        sectionStats={sectionStats}
        totalMembers={memberCount}
      />

      {/* 5-Level Organizational Hierarchy Flow with Real Database Counts */}
      <OrgHierarchyCard loading={loading} unitCounts={unitCounts} />

      {/* Fast Database Tables Navigation with Real Record Counts */}
      <QuickActions loading={loading} tableCounts={tableCounts} />
    </div>
  );
}
