"use client";

import { useId, useMemo, useRef, useState, useEffect } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRelationOptions, type RelationOption } from "@/hooks/use-relation-options";
import { cn } from "@/lib/utils";

interface RelationMultiSelectProps {
  id: string;
  name: string;
  collectionField: string;
  colType?: string;
  value: unknown;
  nullable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onChange: (value: string[]) => void;
}

/**
 * Chuẩn hóa giá trị đầu vào thành danh sách các chuỗi (string[])
 * Hỗ trợ các định dạng:
 * - mảng JS: ["Ấu", "Thiếu"]
 * - chuỗi ngăn cách bởi dấu phẩy: "Ấu, Thiếu"
 * - chuỗi mảng Postgres: "{Ấu,Thiếu}"
 */
function normalizeSelectedValues(val: unknown): string[] {
  if (val == null) return [];
  if (Array.isArray(val)) {
    return val.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return [];
    const clean = trimmed.replace(/^\{|\}$/g, "");
    return clean
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  return [String(val).trim()];
}

export function RelationMultiSelect({
  id,
  name,
  collectionField,
  colType,
  value,
  disabled = false,
  placeholder,
  onChange,
}: RelationMultiSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputSearchId = useId();

  const { options, loading } = useRelationOptions(collectionField);

  const isIdField =
    colType === "BigInt" ||
    colType === "Int" ||
    colType === "UUID" ||
    colType === "ID";

  const selectedValues = useMemo(() => normalizeSelectedValues(value), [value]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearchQuery("");
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Focus ô tìm kiếm khi mở menu
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  // Kiểm tra option có đang được chọn hay không
  const isOptionSelected = (opt: RelationOption) => {
    const keyToMatch = isIdField ? opt.id : opt.name;
    return selectedValues.some(
      (v) =>
        v.toLowerCase() === keyToMatch.toLowerCase() ||
        v.toLowerCase() === opt.name.toLowerCase() ||
        v === opt.id,
    );
  };

  // Lấy label hiển thị từ giá trị đã chọn
  const getLabelForValue = (val: string) => {
    const opt = options.find(
      (o) =>
        o.name.toLowerCase() === val.toLowerCase() ||
        o.id.toLowerCase() === val.toLowerCase() ||
        o.value.toLowerCase() === val.toLowerCase(),
    );
    return opt ? opt.label : val;
  };

  // Toggle chọn / bỏ chọn một option
  const handleToggleOption = (opt: RelationOption) => {
    const optVal = isIdField ? opt.id : opt.name;
    const exists = isOptionSelected(opt);

    let nextValues: string[];
    if (exists) {
      nextValues = selectedValues.filter(
        (v) =>
          v.toLowerCase() !== optVal.toLowerCase() &&
          v.toLowerCase() !== opt.name.toLowerCase() &&
          v !== opt.id,
      );
    } else {
      nextValues = [...selectedValues, optVal];
    }
    onChange(nextValues);
  };

  // Xóa 1 badge đã chọn
  const handleRemoveValue = (valToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextValues = selectedValues.filter(
      (v) => v.toLowerCase() !== valToRemove.toLowerCase(),
    );
    onChange(nextValues);
  };

  // Xóa toàn bộ lựa chọn
  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  // Chọn toàn bộ options hiện có
  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const allVals = options.map((opt) => (isIdField ? opt.id : opt.name));
    onChange(allVals);
  };

  // Lọc options theo ô tìm kiếm
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.name.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q),
    );
  }, [options, searchQuery]);

  return (
    <div ref={containerRef} className="relative w-full" id={`${id}-wrapper`}>
      {/* Trigger Box */}
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
          }
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((prev) => !prev);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={cn(
          "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs transition-colors cursor-pointer select-none",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          disabled && "cursor-not-allowed opacity-50 bg-muted/50",
          open && "ring-1 ring-ring",
        )}
      >
        {selectedValues.length === 0 ? (
          <span className="text-muted-foreground">
            {loading ? "Đang tải danh sách…" : placeholder ? `-- Chọn ${placeholder} --` : "Chọn các mục…"}
          </span>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
            {selectedValues.map((val) => (
              <Badge
                key={val}
                variant="secondary"
                className="gap-1 px-2 py-0.5 text-xs font-medium font-sans flex items-center shrink-0 bg-secondary/80 text-secondary-foreground"
              >
                <span>{getLabelForValue(val)}</span>
                {!disabled && (
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Xóa ${getLabelForValue(val)}`}
                    onClick={(e) => handleRemoveValue(val, e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleRemoveValue(val, e as any);
                      }
                    }}
                    className="rounded-full hover:bg-muted-foreground/20 p-0.5 cursor-pointer inline-flex items-center justify-center transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </span>
                )}
              </Badge>
            ))}
          </div>
        )}

        {/* Action icons right */}
        <div className="ml-auto flex items-center gap-1 text-muted-foreground shrink-0 pl-1">
          {selectedValues.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClearAll}
              title="Xóa tất cả"
              className="p-0.5 hover:text-foreground rounded transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </div>
      </div>

      {/* Hidden input for form association if needed */}
      <input
        type="hidden"
        name={name}
        value={selectedValues.join(",")}
      />

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full min-w-[220px] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95">
          {/* Quick search input */}
          {options.length > 4 && (
            <div className="relative mb-1 px-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                ref={searchInputRef}
                id={inputSearchId}
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-sm bg-muted/50 pl-8 pr-2 py-1 text-xs outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          )}

          {/* Header Action: Select All / Clear All */}
          {options.length > 0 && (
            <div className="flex items-center justify-between px-2 py-1 text-[11px] text-muted-foreground border-b border-border/50 mb-1">
              <span>{selectedValues.length} đã chọn</span>
              <div className="flex items-center gap-2">
                {selectedValues.length < options.length ? (
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="hover:text-primary transition-colors cursor-pointer"
                  >
                    Chọn tất cả
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="hover:text-destructive transition-colors cursor-pointer"
                  >
                    Bỏ chọn tất cả
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div
            role="listbox"
            aria-multiselectable="true"
            className="max-h-56 overflow-y-auto space-y-0.5 p-0.5"
          >
            {loading ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                Đang tải danh sách...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                Không tìm thấy kết quả phù hợp
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const selected = isOptionSelected(opt);
                return (
                  <div
                    key={opt.id}
                    role="option"
                    aria-selected={selected}
                    tabIndex={0}
                    onClick={() => handleToggleOption(opt)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleToggleOption(opt);
                      }
                    }}
                    className={cn(
                      "flex items-center justify-between rounded-sm px-2.5 py-1.5 text-xs cursor-pointer select-none transition-colors",
                      selected
                        ? "bg-accent text-accent-foreground font-medium"
                        : "hover:bg-muted text-foreground",
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className={cn(
                          "h-3.5 w-3.5 rounded border flex items-center justify-center transition-colors",
                          selected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-input bg-transparent",
                        )}
                      >
                        {selected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <span className="truncate">{opt.label}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
