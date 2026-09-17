"use client";

import { useTableSchema } from "@/hooks/use-introspection";
import {
  useTableData,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "@/hooks/use-table-data";
import { CmsHeader } from "./cms-header";
import { TableFilters } from "./table-filters";
import { RowActions } from "./row-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
} from "lucide-react";
import { translateField } from "@/lib/i18n";
import { useRelationMap } from "@/hooks/use-relation-map";
import { matchesSearch, matchesColumnFilters } from "@/lib/utils/search-utils";

interface DataTableProps {
  tableName: string;
}

function getCollectionField(tableName: string): string {
  return `${tableName}Collection`;
}

const MIN_COL_WIDTH = 80;
const ACTIONS_WIDTH = 90;

// Hoisted static arrays — never re-created on render (rendering-hoist-jsx)
const SKELETON_HEADER_CELLS = Array.from({ length: 4 });
const SKELETON_ROW_CELLS = Array.from({ length: 4 });
const SKELETON_ROWS = Array.from({ length: 5 });

export function DataTable({ tableName }: DataTableProps) {
  const typeName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
  const { columns, loading: schemaLoading } = useTableSchema(typeName);
  const collectionField = getCollectionField(tableName);

  // ---- Data fetching (fetch all records for instant multi-column search & filter) ----
  const {
    rows: allRows,
    loading: dataLoading,
    refetch,
  } = useTableData(collectionField, columns);

  const loading = schemaLoading || (dataLoading && allRows.length === 0);

  // ---- Relation label maps for FK columns ----
  const { relationMaps } = useRelationMap(columns);

  // ---- Search & Filter state ----
  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {},
  );

  // ---- Pagination state ----
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(0);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(0);
  }, []);

  const handleFilterChange = useCallback((column: string, value: string) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      if (!value || value === "") {
        delete next[column];
      } else {
        next[column] = value;
      }
      return next;
    });
    setCurrentPage(0);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setColumnFilters({});
    setCurrentPage(0);
  }, []);

  // Filtered rows matching both search query and column filters
  const filteredRows = useMemo(() => {
    return allRows.filter((row) => {
      if (!matchesColumnFilters(row, columnFilters, relationMaps)) {
        return false;
      }
      if (!matchesSearch(row, searchTerm, columns, relationMaps)) {
        return false;
      }
      return true;
    });
  }, [allRows, columnFilters, searchTerm, columns, relationMaps]);

  // Client-side pagination derived calculations
  const totalCount = allRows.length;
  const filteredCount = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages - 1);

  const displayedRows = useMemo(() => {
    const start = safeCurrentPage * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, safeCurrentPage, pageSize]);

  const hasNextPage = safeCurrentPage < totalPages - 1;
  const hasPrevPage = safeCurrentPage > 0;

  const goToNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(totalPages - 1, p + 1));
  }, [totalPages]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(0, p - 1));
  }, []);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(0);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages - 1);
  }, [totalPages]);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0);
  }, []);

  const handleCreated = useCallback(() => {
    setCurrentPage(0);
    refetch();
  }, [refetch]);

  // ---- Column resize state ----
  const [customWidths, setCustomWidths] = useState<Record<number, number>>({});
  const dragState = useRef<{
    colIndex: number;
    startX: number;
    startWidth: number;
  } | null>(null);

  const getColWidth = useCallback(
    (index: number) => customWidths[index] ?? 160,
    [customWidths],
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, colIndex: number) => {
      e.preventDefault();
      e.stopPropagation();
      dragState.current = {
        colIndex,
        startX: e.clientX,
        startWidth: customWidths[colIndex] ?? 160,
      };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [customWidths],
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.current) return;
      const { colIndex, startX, startWidth } = dragState.current;
      const delta = e.clientX - startX;
      const newWidth = Math.max(MIN_COL_WIDTH, startWidth + delta);
      setCustomWidths((prev) => ({
        ...prev,
        [colIndex]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      if (!dragState.current) return;
      dragState.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const fromRecord = filteredCount === 0 ? 0 : safeCurrentPage * pageSize + 1;
  const toRecord = Math.min(filteredCount, (safeCurrentPage + 1) * pageSize);

  return (
    <div>
      <CmsHeader
        tableName={tableName}
        columns={columns}
        onCreated={handleCreated}
      />

      {/* Filter and Search Toolbar */}
      {!schemaLoading && columns.length > 0 ? (
        <TableFilters
          tableName={tableName}
          columns={columns}
          allRows={allRows}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          columnFilters={columnFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          totalCount={totalCount}
          filteredCount={filteredCount}
          relationMaps={relationMaps}
        />
      ) : null}

      <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-md overflow-hidden shadow-xs">
        <Table style={{ tableLayout: "fixed" }}>
          {!loading ? (
            <colgroup>
              {columns.map((col, i) => (
                <col key={col.name} style={{ width: getColWidth(i) }} />
              ))}
              <col style={{ width: ACTIONS_WIDTH }} />
            </colgroup>
          ) : null}

          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b-border/40">
              {loading
                ? SKELETON_HEADER_CELLS.map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-4 w-20 bg-muted-foreground/20" />
                    </TableHead>
                  ))
                : columns.map((col, colIndex) => (
                    <TableHead
                      key={col.name}
                      className="font-semibold text-xs text-muted-foreground uppercase tracking-wider relative group select-none"
                      style={{ width: getColWidth(colIndex) }}
                    >
                      <span className="truncate block pr-2">
                        {translateField(col.name)}
                      </span>
                      <div
                        onMouseDown={(e) => handleResizeStart(e, colIndex)}
                        className="absolute top-0 right-0 w-0.75 h-full cursor-col-resize z-10 group-hover:bg-primary/20 active:bg-primary/40 transition-colors"
                        style={{ touchAction: "none" }}
                        aria-hidden="true"
                      />
                    </TableHead>
                  ))}
              <TableHead
                className="font-semibold text-xs text-muted-foreground uppercase tracking-wider"
                style={{ width: ACTIONS_WIDTH }}
              >
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              SKELETON_ROWS.slice(0, Math.min(pageSize, 5)).map((_, i) => (
                <TableRow key={i} className="border-b-border/20">
                  {SKELETON_ROW_CELLS.map((__, j) => (
                    <TableCell key={j} className="py-4">
                      <Skeleton className="h-4 w-full bg-muted/50" />
                    </TableCell>
                  ))}
                  <TableCell />
                </TableRow>
              ))
            ) : totalCount === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-40 text-center text-muted-foreground font-medium"
                >
                  Chưa có bản ghi nào trong bảng này.
                </TableCell>
              </TableRow>
            ) : filteredRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-44 text-center text-muted-foreground font-medium"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p>
                      Không tìm thấy bản ghi nào khớp với điều kiện tìm kiếm
                      hoặc bộ lọc.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                      className="text-xs gap-1.5 h-8 border-border/50 hover:bg-accent cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Xóa bộ lọc để xem tất cả
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              displayedRows.map((row, idx) => (
                <TableRow
                  key={String(row.id ?? idx)}
                  className="hover:bg-accent/40 border-b-border/20 transition-colors"
                >
                  {columns.map((col) => {
                    const rawValue = row[col.name];
                    // Resolve FK id → label if a relation map exists for this column
                    const relMap = relationMaps[col.name];
                    const displayValue =
                      relMap && rawValue != null
                        ? (relMap.get(String(rawValue)) ?? String(rawValue))
                        : rawValue != null
                          ? String(rawValue)
                          : null;
                    return (
                      <TableCell
                        key={col.name}
                        className="text-sm truncate overflow-hidden py-3"
                      >
                        {displayValue == null ? (
                          <span className="text-muted-foreground/60 italic text-xs">
                            null
                          </span>
                        ) : (
                          <span className="font-medium text-foreground/90">
                            {displayValue}
                          </span>
                        )}
                      </TableCell>
                    );
                  })}

                  <TableCell className="py-3">
                    <RowActions
                      tableName={tableName}
                      columns={columns}
                      row={row}
                      onRefetch={handleCreated}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      {!loading && filteredCount > 0 ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 mt-4 glass rounded-xl border border-border/40">
          {/* Page size selector & item range */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <label htmlFor="page-size-select">Số hàng mỗi trang</label>
              <select
                id="page-size-select"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="h-8.5 rounded-lg border border-border/50 bg-background/50 px-2.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer transition-all hover:bg-background"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs text-muted-foreground">
              Hiển thị <strong className="text-foreground">{fromRecord}</strong>{" "}
              - <strong className="text-foreground">{toRecord}</strong> trên{" "}
              <strong className="text-foreground">{filteredCount}</strong> kết
              quả
            </span>
          </div>

          {/* Page info & navigation */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-foreground/80 mr-2">
              Trang {safeCurrentPage + 1} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-8.5 w-8.5 rounded-lg border-border/50 bg-background/50 hover:bg-background backdrop-blur-sm cursor-pointer"
              onClick={goToFirstPage}
              disabled={!hasPrevPage}
              aria-label="Về trang đầu"
              title="Về trang đầu"
            >
              <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8.5 w-8.5 rounded-lg border-border/50 bg-background/50 hover:bg-background backdrop-blur-sm cursor-pointer"
              onClick={goToPrevPage}
              disabled={!hasPrevPage}
              aria-label="Trang trước"
              title="Trang trước"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8.5 w-8.5 rounded-lg border-border/50 bg-background/50 hover:bg-background backdrop-blur-sm cursor-pointer"
              onClick={goToNextPage}
              disabled={!hasNextPage}
              aria-label="Trang tiếp theo"
              title="Trang tiếp theo"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8.5 w-8.5 rounded-lg border-border/50 bg-background/50 hover:bg-background backdrop-blur-sm cursor-pointer"
              onClick={goToLastPage}
              disabled={!hasNextPage}
              aria-label="Đến trang cuối"
              title="Đến trang cuối"
            >
              <ChevronsRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
