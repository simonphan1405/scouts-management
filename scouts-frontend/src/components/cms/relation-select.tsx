"use client";

import { useMemo } from "react";
import { useRelationOptions } from "@/hooks/use-relation-options";

interface RelationSelectProps {
  id: string;
  name: string;
  collectionField: string;
  colType?: string;
  value: string;
  nullable: boolean;
  disabled?: boolean;
  placeholder: string;
  onChange: (value: string | null) => void;
}

export function RelationSelect({
  id,
  name,
  collectionField,
  colType,
  value,
  nullable,
  disabled = false,
  placeholder,
  onChange,
}: RelationSelectProps) {
  const { options, loading } = useRelationOptions(collectionField);

  // If column type is BigInt, Int, UUID, or ID, the DB column stores the ID (e.g. unit="4", member_id="13").
  // Otherwise (String, enum like section_enum, etc.), the DB column stores the Name (e.g. religion="Khác", current_section="Thiếu").
  const isIdField =
    colType === "BigInt" ||
    colType === "Int" ||
    colType === "UUID" ||
    colType === "ID";

  // Resolve matching selected value: match either by name or id depending on field type
  const selectedValue = useMemo(() => {
    if (value === undefined || value === null || value === "") return "";
    const strVal = String(value).trim();

    if (isIdField) {
      // 1. Match by ID directly
      const byId = options.find((o) => o.id === strVal);
      if (byId) return byId.id;
      // 2. Fallback: match by Name (in case incoming row value was name)
      const byName = options.find(
        (o) => o.name.toLowerCase() === strVal.toLowerCase(),
      );
      if (byName) return byName.id;
    } else {
      // Column expects name/string/enum
      // 1. Match by Name directly
      const byName = options.find(
        (o) => o.name.toLowerCase() === strVal.toLowerCase(),
      );
      if (byName) return byName.name;
      // 2. Fallback: match by ID (in case incoming row value was numeric ID)
      const byId = options.find((o) => o.id === strVal);
      if (byId) return byId.name;
    }

    return strVal;
  }, [value, options, isIdField]);

  return (
    <select
      id={id}
      name={name}
      value={selectedValue}
      required={!nullable}
      disabled={disabled || loading}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === "" ? null : val);
      }}
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    >
      {nullable && (
        <option value="">
          {loading ? "Đang tải…" : `-- ${placeholder} --`}
        </option>
      )}
      {!nullable && (
        <option value="" disabled>
          {loading ? "Đang tải…" : `-- Chọn ${placeholder} --`}
        </option>
      )}
      {/* Temporary placeholder while loading if we already have a selected value */}
      {loading && selectedValue && (
        <option value={selectedValue} disabled>
          {selectedValue}
        </option>
      )}
      {options.map((opt) => {
        const optVal = isIdField ? opt.id : opt.name;
        return (
          <option key={opt.id} value={optVal}>
            {opt.label}
          </option>
        );
      })}
    </select>
  );
}
