"use client";

import { useQuery } from "@apollo/client/react";
import {
  SCHEMA_COLLECTIONS_QUERY,
  TYPE_FIELDS_QUERY,
  isCollectionField,
  collectionFieldToTableName,
  getNodeTypeName,
  parseColumnMeta,
} from "@/lib/graphql/introspection";
import type { GqlField, TableMeta, ColumnMeta } from "@/lib/graphql/types";

interface SchemaQueryResult {
  __schema: {
    queryType: {
      fields: GqlField[];
    };
  };
}

interface TypeQueryResult {
  __type: {
    name: string;
    fields: GqlField[];
  };
}

export function useTableList(): {
  tables: TableMeta[];
  loading: boolean;
  error: Error | undefined;
} {
  const { data, loading, error } = useQuery<SchemaQueryResult>(
    SCHEMA_COLLECTIONS_QUERY
  );

  const tables: TableMeta[] =
    data?.__schema.queryType.fields
      .filter(isCollectionField)
      .map((f) => ({
        name: collectionFieldToTableName(f.name),
        collectionField: f.name,
        typeName: getNodeTypeName(f.name),
      })) ?? [];

  return { tables, loading, error: error as Error | undefined };
}

export function useTableSchema(typeName: string): {
  columns: ColumnMeta[];
  loading: boolean;
  error: Error | undefined;
} {
  const { data, loading, error } = useQuery<TypeQueryResult>(TYPE_FIELDS_QUERY, {
    variables: { typeName },
    skip: !typeName,
  });

  const columns = data?.__type?.fields
    ? parseColumnMeta(data.__type.fields).filter((c) => c.name !== "nodeId")
    : [];

  return { columns, loading, error: error as Error | undefined };
}
