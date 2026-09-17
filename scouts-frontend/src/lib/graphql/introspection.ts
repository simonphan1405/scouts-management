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

/**
 * Map an OBJECT field name (e.g. "councils") to its collection field name
 * (e.g. "councilsCollection") used in GraphQL queries.
 */
function objectFieldToCollectionField(objectFieldName: string): string {
  return `${objectFieldName}Collection`;
}

export function parseColumnMeta(fields: GqlField[]): ColumnMeta[] {
  // Collect OBJECT fields (relationship navigations like "councils", "districts")
  // Map: lowercase type name → collection field name
  // e.g. field name "councils" → type "Councils" → collectionField "councilsCollection"
  const objectFieldsByName = new Map<string, string>();
  for (const f of fields) {
    const kind = resolveKind(f.type);
    if (kind === "OBJECT") {
      // field.name e.g. "councils" → collectionField "councilsCollection"
      objectFieldsByName.set(f.name, objectFieldToCollectionField(f.name));
    }
  }

  return fields
    .filter((f) => {
      const kind = resolveKind(f.type);
      // Only keep scalar and enum fields — reject objects, lists, connections
      return kind === "SCALAR" || kind === "ENUM";
    })
    .map((f) => {
      // Detect FK: scalar field "council" → look for OBJECT field "councils" (plural form)
      // Convention: FK field name + "s" = navigation field name
      const pluralName = `${f.name}s`;
      let relationTo = objectFieldsByName.get(pluralName);
      if (!relationTo) {
        if (f.name === "current_section" || f.name === "section") {
          relationTo = objectFieldsByName.get("sections");
        } else if (f.name.endsWith("_id")) {
          relationTo = objectFieldsByName.get(`${f.name.replace(/_id$/, "")}s`);
        }
      }
      return {
        name: f.name,
        type: resolveTypeName(f.type),
        nullable: isNullable(f.type),
        ...(relationTo ? { relationTo } : {}),
      };
    })
    .filter((c) => c.type !== "Cursor");
}
