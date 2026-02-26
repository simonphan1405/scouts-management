"use client";

import { useCallback } from "react";
import type { ColumnMeta } from "@/lib/graphql/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export function RecordForm({ columns, values, onChange }: RecordFormProps) {
  const writableColumns = columns.filter((c) => !EXCLUDED.includes(c.name));

  const handleChange = useCallback(
    (name: string, value: unknown) => {
      onChange({ ...values, [name]: value });
    },
    [onChange, values],
  );

  return (
    <div className="space-y-4">
      {writableColumns.map((col) => {
        const inputType = getInputType(col.type);
        return (
          <div key={col.name} className="space-y-1">
            <Label
              htmlFor={col.name}
              className="text-sm font-medium capitalize"
            >
              {col.name.replace(/_/g, " ")}
              {!col.nullable && (
                <span className="text-destructive ml-1" aria-hidden="true">*</span>
              )}
            </Label>
            {inputType === "checkbox" ? (
              <input
                id={col.name}
                name={col.name}
                type="checkbox"
                checked={Boolean(values[col.name])}
                onChange={(e) => handleChange(col.name, e.target.checked)}
                className="h-4 w-4"
              />
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
                placeholder={`${col.name.replace(/_/g, " ")}…`}
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

