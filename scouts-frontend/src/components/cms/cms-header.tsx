"use client";

import { Badge } from "@/components/ui/badge";
import { CreateModal } from "./create-modal";
import type { ColumnMeta } from "@/lib/graphql/types";
import { translateTableName } from "@/lib/i18n";

interface CmsHeaderProps {
  tableName: string;
  columns: ColumnMeta[];
  onCreated: () => void;
}

const EXCLUDED = ["id", "created_at", "updated_at"];

export function CmsHeader({ tableName, columns, onCreated }: CmsHeaderProps) {
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
      {hasWritableColumns ? (
        <div className="shrink-0">
          <CreateModal
            tableName={tableName}
            columns={columns}
            onCreated={onCreated}
          />
        </div>
      ) : null}
    </div>
  );
}
