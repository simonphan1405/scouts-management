"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { DashboardHero } from "./dashboard-hero";
import { KpiStats } from "./kpi-stats";
import { SectionsGrid, type SectionLiveStats } from "./sections-grid";
import { OrgHierarchyCard } from "./org-hierarchy-card";
import { QuickActions } from "./quick-actions";

// Valid GraphQL query fetching live data from Supabase pg_graphql
const DASHBOARD_OVERVIEW_QUERY = gql`
  query DashboardOverview {
    membersCollection(first: 500) {
      edges {
        node {
          id
          full_name
          current_section
          role
        }
      }
    }
    sectionsCollection {
      edges {
        node {
          id
          name
        }
      }
    }
    councilsCollection(first: 100) {
      edges {
        node {
          id
          name
        }
      }
    }
    districtsCollection(first: 100) {
      edges {
        node {
          id
          name
        }
      }
    }
    groupsCollection(first: 100) {
      edges {
        node {
          id
          name
        }
      }
    }
    troopsCollection(first: 200) {
      edges {
        node {
          id
          name
          section
        }
      }
    }
    unitsCollection(first: 200) {
      edges {
        node {
          id
          name
        }
      }
    }
    rankingsCollection(first: 100) {
      edges {
        node {
          id
          name
          level
          section
        }
      }
    }
    expensesCollection(first: 500) {
      edges {
        node {
          id
          amount
          purpose
        }
      }
    }
    religionsCollection(first: 100) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

type EdgeNode<T> = { node: T };
type CollectionResponse<T> = { edges?: EdgeNode<T>[] };

interface DashboardData {
  membersCollection?: CollectionResponse<{
    id: string;
    full_name?: string;
    current_section?: string;
    role?: string;
  }>;
  sectionsCollection?: CollectionResponse<{
    id: string;
    name?: string;
  }>;
  councilsCollection?: CollectionResponse<{
    id: string;
    name?: string;
  }>;
  districtsCollection?: CollectionResponse<{
    id: string;
    name?: string;
  }>;
  groupsCollection?: CollectionResponse<{
    id: string;
    name?: string;
  }>;
  troopsCollection?: CollectionResponse<{
    id: string;
    name?: string;
    section?: string;
  }>;
  unitsCollection?: CollectionResponse<{
    id: string;
    name?: string;
  }>;
  rankingsCollection?: CollectionResponse<{
    id: string;
    name?: string;
    level?: number;
    section?: string;
  }>;
  expensesCollection?: CollectionResponse<{
    id: string;
    amount?: number;
    purpose?: string;
  }>;
  religionsCollection?: CollectionResponse<{
    id: string;
    name?: string;
  }>;
}

const SECTION_NAME_MAP: Record<string, string> = {
  nhi: "Nhi",
  au: "Ấu",
  thieu: "Thiếu",
  kha: "Kha",
  trang: "Tráng",
};

export function ScoutsDashboard() {
  const { data, loading } = useQuery<DashboardData>(DASHBOARD_OVERVIEW_QUERY, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
  });

  // Extract actual arrays
  const memberEdges = data?.membersCollection?.edges;
  const sectionEdges = data?.sectionsCollection?.edges;
  const councilEdges = data?.councilsCollection?.edges;
  const districtEdges = data?.districtsCollection?.edges;
  const groupEdges = data?.groupsCollection?.edges;
  const troopEdges = data?.troopsCollection?.edges;
  const unitEdges = data?.unitsCollection?.edges;
  const rankingEdges = data?.rankingsCollection?.edges;
  const expenseEdges = data?.expensesCollection?.edges;
  const religionEdges = data?.religionsCollection?.edges;

  // Real Database Counts
  const memberCount = memberEdges?.length ?? 0;
  const sectionCount = sectionEdges?.length ?? 0;

  const unitCounts = useMemo(
    () => ({
      councils: councilEdges?.length ?? 0,
      districts: districtEdges?.length ?? 0,
      groups: groupEdges?.length ?? 0,
      troops: troopEdges?.length ?? 0,
      units: unitEdges?.length ?? 0,
    }),
    [councilEdges, districtEdges, groupEdges, troopEdges, unitEdges],
  );

  // Sum actual expenses recorded in database
  const expenseTotal = useMemo(() => {
    if (!expenseEdges || expenseEdges.length === 0) return 0;
    return expenseEdges.reduce((sum, e) => sum + (Number(e.node.amount) || 0), 0);
  }, [expenseEdges]);

  // Section-by-section live statistics
  const sectionStats = useMemo(() => {
    const stats: Record<string, SectionLiveStats> = {};

    for (const [key, sectionName] of Object.entries(SECTION_NAME_MAP)) {
      const nameLower = sectionName.toLowerCase();

      // Count members in this section
      const members =
        memberEdges?.filter(
          (m) => m.node.current_section?.toLowerCase() === nameLower,
        ) ?? [];

      // Count troops registered for this section
      const troops =
        troopEdges?.filter(
          (t) => t.node.section?.toLowerCase() === nameLower,
        ) ?? [];

      // Get real rankings for this section from database
      const rankings =
        rankingEdges
          ?.filter((r) => r.node.section?.toLowerCase() === nameLower)
          .sort((a, b) => (a.node.level ?? 0) - (b.node.level ?? 0))
          .map((r) => r.node.name ?? "")
          .filter(Boolean) ?? [];

      const memberNum = members.length;
      const percentage =
        memberCount > 0 ? Math.round((memberNum / memberCount) * 100) : 0;

      stats[key] = {
        memberCount: memberNum,
        troopCount: troops.length,
        rankingCount: rankings.length,
        rankings,
        percentage,
      };
    }

    return stats;
  }, [memberEdges, troopEdges, rankingEdges, memberCount]);

  // Table counts for quick actions
  const tableCounts = useMemo(
    () => ({
      members: memberEdges?.length ?? 0,
      sections: sectionEdges?.length ?? 0,
      councils: councilEdges?.length ?? 0,
      districts: districtEdges?.length ?? 0,
      groups: groupEdges?.length ?? 0,
      troops: troopEdges?.length ?? 0,
      units: unitEdges?.length ?? 0,
      rankings: rankingEdges?.length ?? 0,
      expenses: expenseEdges?.length ?? 0,
      religions: religionEdges?.length ?? 0,
    }),
    [
      memberEdges,
      sectionEdges,
      councilEdges,
      districtEdges,
      groupEdges,
      troopEdges,
      unitEdges,
      rankingEdges,
      expenseEdges,
      religionEdges,
    ],
  );

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
