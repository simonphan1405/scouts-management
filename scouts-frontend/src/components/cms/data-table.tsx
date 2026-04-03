"use client";

import { useTableSchema } from "@/hooks/use-introspection";
import {
  useTableData,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "@/hooks/use-table-data";
import { CmsHeader } from "./cms-header";
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
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft } from "lucide-react";

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

  // ---- Pagination state ----
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(0);
  // cursors[i] = cursor to start page i. cursors[0] = null (first page)
  const [cursors, setCursors] = useState<(string | null)[]>([null]);

  const pagination = { cursors, currentPage, pageSize };

  const {
    rows,
    loading: dataLoading,
    refetch,
    pageInfo,
  } = useTableData(collectionField, columns, pagination);

  const loading = schemaLoading || (dataLoading && rows.length === 0);

  // Reset pagination when table changes (derived from prop — intentional setState in effect)
  useEffect(() => {
    setCurrentPage(0); // eslint-disable-line react-hooks/set-state-in-effect
    setCursors([null]);
  }, [tableName]);

  // Use primitive deps to avoid stale closure (rerender-dependencies)
  const hasNextPage = pageInfo.hasNextPage;
  const endCursor = pageInfo.endCursor;

  const goToNextPage = useCallback(() => {
    if (!hasNextPage || !endCursor) return;
    const nextPage = currentPage + 1;
    setCursors((prev) => {
      const next = [...prev];
      next[nextPage] = endCursor;
      return next;
    });
    setCurrentPage(nextPage);
  }, [currentPage, hasNextPage, endCursor]);

  const goToPrevPage = useCallback(() => {
    if (currentPage <= 0) return;
    setCurrentPage(currentPage - 1);
  }, [currentPage]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(0);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0);
    setCursors([null]);
  }, []);

  const handleCreated = useCallback(() => {
    // Reset to first page and refresh
    setCurrentPage(0);
    setCursors([null]);
    refetch();
  }, [refetch]);

  // ---- Column resize state ----
  const [colWidths, setColWidths] = useState<number[]>([]);
  const dragState = useRef<{
    colIndex: number;
    startX: number;
    startWidth: number;
  } | null>(null);

  // Sync colWidths when columns change (initializing from schema — intentional setState in effect)
  useEffect(() => {
    if (columns.length > 0) {
      setColWidths((prev) => { // eslint-disable-line react-hooks/set-state-in-effect
        if (prev.length === columns.length) return prev;
        return columns.map(() => 160);
      });
    }
  }, [columns]);


  const handleResizeStart = useCallback(
    (e: React.MouseEvent, colIndex: number) => {
      e.preventDefault();
      e.stopPropagation();
      dragState.current = {
        colIndex,
        startX: e.clientX,
        startWidth: colWidths[colIndex] ?? 160,
      };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [colWidths],
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.current) return;
      const { colIndex, startX, startWidth } = dragState.current;
      const delta = e.clientX - startX;
      const newWidth = Math.max(MIN_COL_WIDTH, startWidth + delta);
      setColWidths((prev) => {
        const next = [...prev];
        next[colIndex] = newWidth;
        return next;
      });
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

  return (
    <div>
      <CmsHeader
        tableName={tableName}
        columns={columns}
        onCreated={handleCreated}
      />

      <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-md overflow-hidden shadow-xs">
        <Table style={{ tableLayout: "fixed" }}>
          {!loading && colWidths.length > 0 ? (
            <colgroup>
              {columns.map((col, i) => (
                <col key={col.name} style={{ width: colWidths[i] ?? 160 }} />
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
                      style={{ width: colWidths[colIndex] ?? 160 }}
                    >
                      <span className="truncate block pr-2">{col.name}</span>
                      <div
                        onMouseDown={(e) => handleResizeStart(e, colIndex)}
                        className="absolute top-0 right-0 w-[3px] h-full cursor-col-resize z-10 group-hover:bg-primary/20 active:bg-primary/40 transition-colors"
                        style={{ touchAction: "none" }}
                        aria-hidden="true"
                      />
                    </TableHead>
                  ))}
              <TableHead
                className="text-right font-semibold text-xs text-muted-foreground uppercase tracking-wider"
                style={{ width: ACTIONS_WIDTH }}
              >
                Actions
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
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-40 text-center text-muted-foreground font-medium"
                >
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow
                  key={String(row.id ?? idx)}
                  className="hover:bg-accent/40 border-b-border/20 transition-colors"
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.name}
                      className="text-sm truncate overflow-hidden py-3"
                    >
                      {row[col.name] == null ? (
                        <span className="text-muted-foreground/60 italic text-xs">
                          null
                        </span>
                      ) : (
                        <span className="font-medium text-foreground/90">{String(row[col.name])}</span>
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-right py-3">
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
      {!loading ? (
        <div className="flex items-center justify-between p-3 mt-4 glass rounded-xl border border-border/40">
          {/* Page size selector */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
            <label htmlFor="page-size-select">Rows per page</label>
            <select
              id="page-size-select"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="h-9 rounded-lg border border-border/50 bg-background/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer transition-all hover:bg-background"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Page info & navigation */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground/80 mr-3">
              Page {currentPage + 1}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg border-border/50 bg-background/50 hover:bg-background backdrop-blur-sm"
              onClick={goToFirstPage}
              disabled={currentPage === 0}
              aria-label="Go to first page"
            >
              <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg border-border/50 bg-background/50 hover:bg-background backdrop-blur-sm"
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              aria-label="Go to previous page"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg border-border/50 bg-background/50 hover:bg-background backdrop-blur-sm"
              onClick={goToNextPage}
              disabled={!hasNextPage}
              aria-label="Go to next page"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
