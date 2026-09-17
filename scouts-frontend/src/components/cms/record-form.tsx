"use client";

import { useCallback } from "react";
import type { ColumnMeta } from "@/lib/graphql/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { translateField } from "@/lib/i18n";
import { RelationSelect } from "./relation-select";

const EXCLUDED = ["nodeId", "id", "created_at", "updated_at"];

function getInputType(gqlType: string): string {
  switch (gqlType) {
    case "Int":
    case "BigInt":
    case "Float":
      return "number";
    case "Date":
      return "date";
    case "Datetime":
      return "datetime-local";
    case "Boolean":
      return "checkbox";
    default:
      return "text";
  }
}

interface RecordFormProps {
  columns: ColumnMeta[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
}

const FULL_WIDTH_FIELDS = ["notes", "description", "content", "address", "requirement"];

export function RecordForm({ columns, values, onChange }: RecordFormProps) {
  const writableColumns = columns.filter((c) => !EXCLUDED.includes(c.name));

  const handleChange = useCallback(
    (name: string, value: unknown) => {
      onChange({ ...values, [name]: value });
    },
    [onChange, values],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {writableColumns.map((col) => {
        const inputType = getInputType(col.type);
        const isFullWidth = FULL_WIDTH_FIELDS.includes(col.name.toLowerCase());
        return (
          <div
            key={col.name}
            className={`space-y-1.5 ${isFullWidth ? "sm:col-span-2" : ""}`}
          >
            <Label
              htmlFor={col.name}
              className="text-sm font-medium"
            >
              {translateField(col.name)}
              {!col.nullable && (
                <span className="text-destructive ml-1" aria-hidden="true">*</span>
              )}
            </Label>

            {/* FK relation field → dropdown select */}
            {col.relationTo ? (
              <RelationSelect
                id={col.name}
                name={col.name}
                collectionField={col.relationTo}
                colType={col.type}
                value={String(values[col.name] ?? "")}
                nullable={col.nullable}
                placeholder={translateField(col.name)}
                onChange={(val) => {
                  const finalVal =
                    (col.type === "BigInt" || col.type === "Int") && val != null && val !== ""
                      ? Number(val)
                      : val;
                  handleChange(col.name, finalVal);
                }}
              />
            ) : inputType === "checkbox" ? (
              <div className="flex items-center h-9">
                <input
                  id={col.name}
                  name={col.name}
                  type="checkbox"
                  checked={Boolean(values[col.name])}
                  onChange={(e) => handleChange(col.name, e.target.checked)}
                  className="h-4 w-4 rounded border-border focus:ring-primary cursor-pointer"
                />
              </div>
            ) : (
              <Input
                id={col.name}
                name={col.name}
                type={inputType}
                value={String(values[col.name] ?? "")}
                onChange={(e) => {
                  const val =
                    inputType === "number"
                      ? e.target.value === ""
                        ? null
                        : Number(e.target.value)
                      : e.target.value;
                  handleChange(col.name, val);
                }}
                placeholder={`${translateField(col.name)}…`}
                required={!col.nullable}
                autoComplete="off"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
