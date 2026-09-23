"use client";

import { useCallback, useEffect, useState } from "react";
import type { ColumnMeta } from "@/lib/graphql/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { translateField } from "@/lib/i18n";
import { RelationSelect } from "./relation-select";
import { RelationMultiSelect } from "./relation-multi-select";
import { apiClient } from "@/lib/api-client";

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
  tableName?: string;
  columns: ColumnMeta[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
}

const FULL_WIDTH_FIELDS = [
  "notes",
  "description",
  "content",
  "address",
  "requirement",
];

export function RecordForm({
  tableName,
  columns,
  values,
  onChange,
}: RecordFormProps) {
  const writableColumns = columns.filter((c) => !EXCLUDED.includes(c.name));

  const [hierarchyData, setHierarchyData] = useState<{
    troops: any[];
    groups: any[];
    districts: any[];
    units: any[];
  }>({ troops: [], groups: [], districts: [], units: [] });

  useEffect(() => {
    if (tableName !== "members") return;
    let isMounted = true;
    Promise.all([
      apiClient.get<{ rows: any[] }>("/tables/troops"),
      apiClient.get<{ rows: any[] }>("/tables/groups"),
      apiClient.get<{ rows: any[] }>("/tables/districts"),
      apiClient.get<{ rows: any[] }>("/tables/units"),
    ])
      .then(([tRes, gRes, dRes, uRes]) => {
        if (!isMounted) return;
        setHierarchyData({
          troops: tRes.rows || [],
          groups: gRes.rows || [],
          districts: dRes.rows || [],
          units: uRes.rows || [],
        });
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [tableName]);

  const handleChange = useCallback(
    (name: string, value: unknown) => {
      let nextValues = { ...values, [name]: value };

      // Đối với bảng thành viên: tự động truy vấn ngược từ Đoàn -> Liên đoàn -> Đạo -> Châu
      if (tableName === "members") {
        if (name === "unit" && value && !nextValues.troop) {
          const u = hierarchyData.units.find(
            (item) =>
              String(item.id) === String(value) ||
              String(item.name).toLowerCase() === String(value).toLowerCase(),
          );
          if (u && u.troop) {
            nextValues.troop = u.troop;
            name = "troop";
            value = u.troop;
          }
        }

        if (name === "troop") {
          if (!value) {
            nextValues = {
              ...nextValues,
              group: null,
              district: null,
              council: null,
            };
          } else {
            const strVal = String(value).trim().toLowerCase();
            const t = hierarchyData.troops.find(
              (item) =>
                String(item.id).toLowerCase() === strVal ||
                String(item.name).trim().toLowerCase() === strVal,
            );
            if (t && t.group) {
              nextValues.group = t.group;
              const gStr = String(t.group).trim().toLowerCase();
              const g = hierarchyData.groups.find(
                (item) =>
                  String(item.id).toLowerCase() === gStr ||
                  String(item.name).trim().toLowerCase() === gStr,
              );
              if (g && g.district) {
                nextValues.district = g.district;
                const dStr = String(g.district).trim().toLowerCase();
                const d = hierarchyData.districts.find(
                  (item) =>
                    String(item.id).toLowerCase() === dStr ||
                    String(item.name).trim().toLowerCase() === dStr,
                );
                if (d && d.council) {
                  nextValues.council = d.council;
                }
              }
            }
          }
        }
      }

      onChange(nextValues);
    },
    [onChange, values, tableName, hierarchyData],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {writableColumns.map((col) => {
        const inputType = getInputType(col.type);
        const isFullWidth = FULL_WIDTH_FIELDS.includes(col.name.toLowerCase());
        const isHierarchyField =
          tableName === "members" &&
          ["group", "district", "council"].includes(col.name);

        return (
          <div
            key={col.name}
            className={`space-y-1.5 ${isFullWidth ? "sm:col-span-2" : ""}`}
          >
            <Label
              htmlFor={col.name}
              className="text-sm font-medium flex items-center justify-between"
            >
              <span>
                {translateField(col.name)}
                {!col.nullable && (
                  <span className="text-destructive ml-1" aria-hidden="true">
                    *
                  </span>
                )}
              </span>
              {isHierarchyField && (
                <span className="text-xs text-muted-foreground font-normal italic">
                  (Tự động theo Đoàn)
                </span>
              )}
            </Label>

            {/* Multi-Select relation field (e.g. previous_sections) */}
            {col.isMulti || col.name === "previous_sections" ? (
              <RelationMultiSelect
                id={col.name}
                name={col.name}
                collectionField={col.relationTo || "sectionsCollection"}
                colType={col.type}
                value={values[col.name]}
                nullable={col.nullable}
                disabled={isHierarchyField}
                placeholder={translateField(col.name)}
                onChange={(val) => handleChange(col.name, val)}
              />
            ) : col.relationTo ? (
              <RelationSelect
                id={col.name}
                name={col.name}
                collectionField={col.relationTo}
                colType={col.type}
                value={String(values[col.name] ?? "")}
                nullable={col.nullable}
                disabled={isHierarchyField}
                placeholder={translateField(col.name)}
                onChange={(val) => {
                  const finalVal =
                    (col.type === "BigInt" || col.type === "Int") &&
                    val != null &&
                    val !== ""
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
                value={
                  values[col.name] == null
                    ? ""
                    : Array.isArray(values[col.name])
                      ? (values[col.name] as any[]).join(", ")
                      : String(values[col.name])
                }
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
