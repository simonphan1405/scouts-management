"use client";

import { useRelationOptions } from "@/hooks/use-relation-options";

interface RelationSelectProps {
  id: string;
  name: string;
  collectionField: string;
  value: string;
  nullable: boolean;
  placeholder: string;
  onChange: (value: string | null) => void;
}

export function RelationSelect({
  id,
  name,
  collectionField,
  value,
  nullable,
  placeholder,
  onChange,
}: RelationSelectProps) {
  const { options, loading } = useRelationOptions(collectionField);

  return (
    <select
      id={id}
      name={name}
      value={value ?? ""}
      required={!nullable}
      disabled={loading}
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
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
