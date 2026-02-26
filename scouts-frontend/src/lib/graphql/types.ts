export interface GqlField {
  name: string;
  type: {
    name: string | null;
    kind: string;
    ofType: {
      name: string | null;
      kind: string;
      ofType: {
        name: string | null;
        kind: string;
      } | null;
    } | null;
  };
}

export interface GqlType {
  name: string;
  fields: GqlField[] | null;
}

export interface TableMeta {
  name: string;
  collectionField: string;
  typeName: string;
}

export interface ColumnMeta {
  name: string;
  type: string;
  nullable: boolean;
}
