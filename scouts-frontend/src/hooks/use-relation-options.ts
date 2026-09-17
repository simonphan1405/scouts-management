"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";

export interface RelationOption {
  id: string;
  name: string;
  value: string; // UUID / BigInt id
  label: string; // display name
}

// Build a lightweight query fetching only id + name (or full_name) from a collection
function buildRelationQuery(collectionField: string) {
  const opName = `RelOpts_${collectionField}`;
  const isMembers = collectionField === "membersCollection";
  const nameField = isMembers ? "full_name" : "name";
  return gql`
    query ${opName}($first: Int) {
      ${collectionField}(first: $first) {
        edges {
          node {
            id
            ${nameField}
          }
        }
      }
    }
  `;
}

type CollectionData = {
  edges: { node: { id: string | number; name?: string; full_name?: string } }[];
};

/**
 * Fetch all records from a related collection and return them as
 * { id, name, value, label } options for use in a <select>.
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
      collection?.edges.map((e) => {
        const id = String(e.node.id);
        const name = String(e.node.name ?? e.node.full_name ?? e.node.id);
        return {
          id,
          name,
          value: id,
          label: name,
        };
      }) ?? []
    );
  }, [data, collectionField]);

  return { options, loading };
}
