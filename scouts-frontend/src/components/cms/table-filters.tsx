"use client";

import { useMemo, useState, useId } from "react";
import { Search, X, Filter, RotateCcw, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { translateField, translateTableName } from "@/lib/i18n";
import type { ColumnMeta } from "@/lib/graphql/types";
import { cn } from "@/lib/utils";

interface TableFiltersProps {
  tableName: string;
  columns: ColumnMeta[];
  allRows: Record<string, unknown>[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  columnFilters: Record<string, string>;
  onFilterChange: (column: string, value: string) => void;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
  relationMaps: Record<string, Map<string, string>>;
}

export function TableFilters({
  tableName,
  columns,
  allRows,
  searchTerm,
  onSearchChange,
  columnFilters,
  onFilterChange,
  onClearFilters,
  totalCount,
  filteredCount,
  relationMaps,
}: TableFiltersProps) {
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const searchInputId = useId();

  // Columns suitable for filtering: exclude IDs and dates
  const filterableColumns = useMemo(() => {
    return columns.filter(
      (c) =>
        !["id", "nodeId", "created_at", "updated_at"].includes(c.name) &&
        (c.relationTo ||
          c.type === "String" ||
          c.type === "Int" ||
          c.type === "Boolean"),
    );
  }, [columns]);

  // Active filters count (search term + column filters)
  const activeFiltersList = useMemo(() => {
    return Object.entries(columnFilters).filter(
      ([, value]) => value != null && value !== "",
    );
  }, [columnFilters]);

  const activeCount = activeFiltersList.length + (searchTerm ? 1 : 0);

  // Distinct values for each filterable column to populate select dropdowns
  const columnOptionsMap = useMemo(() => {
    const map: Record<string, { value: string; label: string }[]> = {};

    for (const col of filterableColumns) {
      // If column is a foreign key, use options from relationMaps
      if (col.relationTo && relationMaps[col.name]) {
        const relMap = relationMaps[col.name];
        map[col.name] = Array.from(relMap.entries()).map(([val, label]) => ({
          value: val,
          label,
        }));
      } else {
        // Otherwise, extract distinct non-null values from rows
        const uniqueValues = new Set<string>();
        for (const row of allRows) {
          const val = row[col.name];
          if (val != null && String(val).trim() !== "") {
            uniqueValues.add(String(val));
          }
        }
        map[col.name] = Array.from(uniqueValues)
          .sort((a, b) => a.localeCompare(b, "vi"))
          .map((val) => ({
            value: val,
            label: val,
          }));
      }
    }

    return map;
  }, [filterableColumns, relationMaps, allRows]);

  // Quick filter columns (top 2-3 prominent columns, e.g. FKs or section/gender)
  const quickFilterColumns = useMemo(() => {
    return filterableColumns
      .filter(
        (c) =>
          c.relationTo ||
          ["current_section", "section", "gender", "unit_type", "role", "status"].includes(
            c.name,
          ),
      )
      .slice(0, 3);
  }, [filterableColumns]);

  return (
    <div className="space-y-3 mb-4">
      {/* Top Toolbar: Search Bar + Quick Filters + Toggle Advanced Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Universal Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            id={searchInputId}
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Tìm kiếm trong bảng ${translateTableName(tableName)}...`}
            className="pl-9 pr-8 h-9.5 bg-card/60 backdrop-blur-sm border-border/50 text-sm focus-visible:ring-primary/40 transition-all placeholder:text-muted-foreground/70"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/60 transition-colors"
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        {/* Quick Filter Selects (if applicable) */}
        {quickFilterColumns.map((col) => {
          const options = columnOptionsMap[col.name] ?? [];
          if (options.length === 0) return null;

          const currentValue = columnFilters[col.name] ?? "";

          return (
            <div key={col.name} className="relative shrink-0 min-w-[140px] max-w-[200px]">
              <select
                value={currentValue}
                onChange={(e) => onFilterChange(col.name, e.target.value)}
                className="w-full h-9.5 rounded-lg border border-border/50 bg-card/60 backdrop-blur-sm px-2.5 pr-7 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer transition-all hover:bg-card truncate appearance-none"
                aria-label={`Lọc theo ${translateField(col.name)}`}
              >
                <option value="">-- {translateField(col.name)} --</option>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>
          );
        })}

        {/* Filter Panel Toggle Button */}
        <Button
          type="button"
          variant={activeFiltersList.length > 0 ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilterPanel((prev) => !prev)}
          className={cn(
            "h-9.5 shrink-0 gap-1.5 px-3 rounded-lg text-xs font-semibold border-border/50 transition-all cursor-pointer",
            activeFiltersList.length > 0
              ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
              : "bg-card/60 backdrop-blur-sm hover:bg-card",
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          <span>Bộ lọc</span>
          {activeFiltersList.length > 0 ? (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-primary-foreground/20 text-[10px] font-bold">
              {activeFiltersList.length}
            </span>
          ) : null}
        </Button>

        {/* Clear all filters button if anything is filtered */}
        {activeCount > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9.5 shrink-0 gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Xóa tất cả bộ lọc"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Đặt lại</span>
          </Button>
        ) : null}
      </div>

      {/* Expandable Advanced Column Filter Panel */}
      {showFilterPanel ? (
        <div className="p-3.5 rounded-xl border border-border/40 bg-card/70 backdrop-blur-md space-y-3 animate-fade-in-up shadow-xs">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground/80 tracking-wide uppercase flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-primary" />
              Lọc dữ liệu theo cột
            </h4>
            <span className="text-[11px] text-muted-foreground">
              Chọn cột và giá trị để lọc chính xác
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {filterableColumns.map((col) => {
              const options = columnOptionsMap[col.name] ?? [];
              const currentValue = columnFilters[col.name] ?? "";

              return (
                <div key={col.name} className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground block truncate">
                    {translateField(col.name)}
                  </label>
                  {options.length > 0 ? (
                    <div className="relative">
                      <select
                        value={currentValue}
                        onChange={(e) => onFilterChange(col.name, e.target.value)}
                        className="w-full h-8.5 rounded-md border border-border/50 bg-background/60 px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary truncate appearance-none cursor-pointer"
                      >
                        <option value="">Tất cả</option>
                        {options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  ) : (
                    <Input
                      type="text"
                      value={currentValue}
                      onChange={(e) => onFilterChange(col.name, e.target.value)}
                      placeholder={`Lọc theo ${translateField(col.name)}...`}
                      className="h-8.5 text-xs bg-background/60 border-border/50"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Active Filter Badges & Results Counter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {searchTerm ? (
            <Badge
              variant="secondary"
              className="gap-1.5 pl-2 pr-1.5 py-0.5 text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors"
            >
              <span>
                Từ khóa: <strong className="font-semibold">&quot;{searchTerm}&quot;</strong>
              </span>
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="rounded-full p-0.5 hover:bg-primary/20 transition-colors cursor-pointer"
                aria-label="Xóa bộ lọc tìm kiếm"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}

          {activeFiltersList.map(([colName, filterVal]) => {
            const relMap = relationMaps[colName];
            const displayLabel = relMap?.get(filterVal) ?? filterVal;

            return (
              <Badge
                key={colName}
                variant="secondary"
                className="gap-1.5 pl-2 pr-1.5 py-0.5 text-xs bg-accent/60 text-foreground border-border/50 hover:bg-accent/80 transition-colors"
              >
                <span>
                  {translateField(colName)}:{" "}
                  <strong className="font-semibold text-primary">{displayLabel}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => onFilterChange(colName, "")}
                  className="rounded-full p-0.5 hover:bg-muted transition-colors cursor-pointer"
                  aria-label={`Xóa bộ lọc ${translateField(colName)}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}

          {activeCount > 0 ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-[11px] text-muted-foreground hover:text-destructive transition-colors ml-1 underline cursor-pointer"
            >
              Xóa tất cả
            </button>
          ) : null}
        </div>

        {/* Results Counter */}
        <div className="text-xs text-muted-foreground font-medium ml-auto">
          {activeCount > 0 ? (
            <span>
              Tìm thấy <strong className="text-foreground font-semibold">{filteredCount}</strong> / {totalCount} bản ghi
            </span>
          ) : (
            <span>
              Tổng số <strong className="text-foreground font-semibold">{totalCount}</strong> bản ghi
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
