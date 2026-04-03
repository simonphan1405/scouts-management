"use client";

import { useCallback, useMemo } from "react";
import { useMutation } from "@apollo/client/react";
import { buildDeleteMutation } from "@/lib/graphql/query-builder";

export function useDeleteRecord(tableName: string) {
  const mutation = useMemo(() => buildDeleteMutation(tableName), [tableName]);
  const [mutate, { loading, error }] = useMutation(mutation);

  const deleteRecord = useCallback(
    (id: string) => mutate({ variables: { id } }),
    [mutate],
  );

  return { deleteRecord, loading, error };
}

