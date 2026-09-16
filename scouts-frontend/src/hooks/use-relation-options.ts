"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";

export interface RelationOption {
  value: string; // UUID id
  label: string; // display name
}

// Build a lightweight query fetching only id + name from a collection
function buildRelationQuery(collectionField: string) {
  const opName = `RelOpts_${collectionField}`;
  return gql`
    query ${opName}($first: Int) {
      ${collectionField}(first: $first) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `;
}

type CollectionData = {
  edges: { node: { id: string; name?: string } }[];
};

/**
 * Fetch all records from a related collection and return them as
 * { value: id, label: name } options for use in a <select>.
 *
 * @param collectionField - e.g. "councilsCollection"
 */
export function useRelationOptions(collectionField: string | undefined): {
  options: RelationOption[];
  loading: boolean;
} {
  const query = useMemo(
    () => (collectionField ? buildRelationQuery(collectionField) : null),
    [collectionField],
  );

  const { data, loading } = useQuery(query ?? gql`query _Skip { __typename }`, {
    variables: { first: 1000 },
    skip: !collectionField || !query,
    fetchPolicy: "cache-first",
  });

  const options: RelationOption[] = useMemo(() => {
    if (!collectionField || !data) return [];
    const collection = (data as Record<string, CollectionData>)[collectionField];
    return (
      collection?.edges.map((e) => ({
        value: e.node.id,
        label: e.node.name ?? e.node.id,
      })) ?? []
    );
  }, [data, collectionField]);

  return { options, loading };
}
