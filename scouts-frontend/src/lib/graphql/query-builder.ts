import { gql, DocumentNode } from "@apollo/client";
import type { ColumnMeta } from "./types";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Unique operation names per table prevent Apollo cache collisions across tables
export function buildCollectionQuery(
  collectionField: string,
  columns: ColumnMeta[],
): DocumentNode {
  const fields = columns.map((c) => c.name).join("\n        ");
  const opName = `Get_${collectionField}`;
  return gql`
    query ${opName}($first: Int, $after: Cursor) {
      ${collectionField}(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            ${fields}
          }
        }
      }
    }
  `;
}

export function buildInsertMutation(
  tableName: string,
  columns: ColumnMeta[],
): DocumentNode {
  const writableColumns = columns.filter(
    (c) => !["nodeId", "id", "created_at", "updated_at"].includes(c.name),
  );
  const inputFields = writableColumns
    .map((c) => `$${c.name}: ${c.type}`)
    .join(", ");
  const objectFields = writableColumns
    .map((c) => `${c.name}: $${c.name}`)
    .join(", ");
  const returnFields = columns.map((c) => c.name).join("\n        ");
  const mutationName = `insertInto${capitalize(tableName)}Collection`;
  const opName = `Insert_${capitalize(tableName)}`;
  if (writableColumns.length === 0) {
    throw new Error(
      `Table "${tableName}" has no writable columns — cannot build insert mutation.`,
    );
  }

  const varDecl = `(${inputFields})`;

  return gql`
    mutation ${opName}${varDecl} {
      ${mutationName}(objects: [{ ${objectFields} }]) {
        records {
          ${returnFields}
        }
      }
    }
  `;
}

export function buildUpdateMutation(
  tableName: string,
  columns: ColumnMeta[],
): DocumentNode {
  const writableColumns = columns.filter(
    (c) => !["nodeId", "id", "created_at", "updated_at"].includes(c.name),
  );
  const inputFields = [
    "$id: UUID!",
    ...writableColumns.map((c) => `$${c.name}: ${c.type}`),
  ].join(", ");
  const setFields = writableColumns
    .map((c) => `${c.name}: $${c.name}`)
    .join(", ");
  const returnFields = columns.map((c) => c.name).join("\n        ");
  const mutationName = `update${capitalize(tableName)}Collection`;
  const opName = `Update_${capitalize(tableName)}`;

  return gql`
    mutation ${opName}(${inputFields}) {
      ${mutationName}(
        filter: { id: { eq: $id } }
        set: { ${setFields} }
      ) {
        records {
          ${returnFields}
        }
      }
    }
  `;
}

export function buildDeleteMutation(tableName: string): DocumentNode {
  const mutationName = `deleteFrom${capitalize(tableName)}Collection`;
  const opName = `Delete_${capitalize(tableName)}`;
  return gql`
    mutation ${opName}($id: UUID!) {
      ${mutationName}(filter: { id: { eq: $id } }) {
        records {
          id
        }
      }
    }
  `;
}
