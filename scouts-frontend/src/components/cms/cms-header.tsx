"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { CreateModal } from "./create-modal";
import type { ColumnMeta } from "@/lib/graphql/types";
import { translateTableName } from "@/lib/i18n";

interface CmsHeaderProps {
  tableName: string;
  columns: ColumnMeta[];
  onCreated: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

const EXCLUDED = ["id", "created_at", "updated_at"];

export function CmsHeader({
  tableName,
  columns,
  onCreated,
  onRefresh,
  loading = false,
}: CmsHeaderProps) {
  const hasWritableColumns = columns.some((c) => !EXCLUDED.includes(c.name));

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold capitalize tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60 truncate">
            {translateTableName(tableName)}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-0.5 sm:mt-1">
            Quản lý dữ liệu hệ thống
          </p>
        </div>
        <Badge
          variant="secondary"
          className="shrink-0 bg-primary/10 text-primary border-primary/20 text-[11px] sm:text-xs mt-1 sm:mt-0"
        >
          {columns.length} cột
        </Badge>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onRefresh ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="gap-1.5 cursor-pointer text-xs"
            title="Làm mới dữ liệu"
          >
            <RotateCcw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">Làm mới</span>
          </Button>
        ) : null}

        {hasWritableColumns ? (
          <CreateModal
            tableName={tableName}
            columns={columns}
            onCreated={onCreated}
          />
        ) : null}
      </div>
    </div>
  );
}
