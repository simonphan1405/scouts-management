import { gql } from "@apollo/client";
import type { GqlField, ColumnMeta } from "./types";

export const SCHEMA_COLLECTIONS_QUERY = gql`
  query SchemaCollections {
    __schema {
      queryType {
        fields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }
    }
  }
`;

export const TYPE_FIELDS_QUERY = gql`
  query TypeFields($typeName: String!) {
    __type(name: $typeName) {
      name
      fields {
        name
        type {
          name
          kind
          ofType {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
    }
  }
`;

export function isCollectionField(field: GqlField): boolean {
  return field.name.endsWith("Collection");
}

export function collectionFieldToTableName(fieldName: string): string {
  return fieldName.replace(/Collection$/, "");
}

export function getNodeTypeName(collectionField: string): string {
  const tableName = collectionFieldToTableName(collectionField);
  return tableName.charAt(0).toUpperCase() + tableName.slice(1);
}

function resolveTypeName(type: GqlField["type"]): string {
  if (type.kind === "NON_NULL" && type.ofType) {
    return resolveTypeName(type.ofType as GqlField["type"]);
  }
  if (type.kind === "SCALAR" || type.kind === "ENUM") {
    return type.name ?? "String";
  }
  if (type.ofType) {
    return resolveTypeName(type.ofType as GqlField["type"]);
  }
  return type.name ?? "String";
}

function resolveKind(type: GqlField["type"]): string {
  if (type.kind === "NON_NULL" && type.ofType) {
    return resolveKind(type.ofType as GqlField["type"]);
  }
  return type.kind;
}

function isNullable(type: GqlField["type"]): boolean {
  return type.kind !== "NON_NULL";
}

export function parseColumnMeta(fields: GqlField[]): ColumnMeta[] {
  return fields
    .filter((f) => {
      const kind = resolveKind(f.type);
      // Only keep scalar and enum fields — reject objects, lists, connections
      return kind === "SCALAR" || kind === "ENUM";
    })
    .map((f) => ({
      name: f.name,
      type: resolveTypeName(f.type),
      nullable: isNullable(f.type),
    }))
    .filter((c) => c.type !== "Cursor");
}
