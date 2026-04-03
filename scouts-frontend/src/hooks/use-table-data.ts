"use client";

import { useMemo, useCallback } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { buildCollectionQuery } from "@/lib/graphql/query-builder";
import type { ColumnMeta } from "@/lib/graphql/types";

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

const NOOP_QUERY = gql`
  query Noop {
    __typename
  }
`;

type Row = Record<string, unknown>;
type CollectionData = {
  edges: { node: Row }[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

interface PaginationState {
  /** Stack of cursors for visited pages. Index i = cursor to start page i+1. Index 0 is always null (first page). */
  cursors: (string | null)[];
  currentPage: number;
  pageSize: number;
}

export function useTableData(
  collectionField: string,
  columns: ColumnMeta[],
  pagination: PaginationState,
) {
  const skip = !collectionField || columns.length === 0;

  const columnKey = columns.map((c) => c.name).join(",");
  const query = useMemo(
    () => (skip ? NOOP_QUERY : buildCollectionQuery(collectionField, columns)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collectionField, columnKey, skip],
  );

  const cursor = pagination.cursors[pagination.currentPage] ?? null;

  const { data, loading, error, refetch } = useQuery(query, {
    variables: { first: pagination.pageSize, after: cursor },
    skip,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const typedData = data as Record<string, CollectionData> | undefined;
  const collection = typedData?.[collectionField];
  const rows: Row[] = collection?.edges.map((e) => e.node) ?? [];
  const pageInfo = collection?.pageInfo ?? {
    hasNextPage: false,
    endCursor: null,
  };

  const reset = useCallback(() => {
    refetch({ first: pagination.pageSize, after: null });
  }, [refetch, pagination.pageSize]);

  return { rows, loading, error, refetch: reset, pageInfo };
}
