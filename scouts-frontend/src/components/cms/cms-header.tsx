"use client";

import { Badge } from "@/components/ui/badge";
import { CreateModal } from "./create-modal";
import type { ColumnMeta } from "@/lib/graphql/types";

interface CmsHeaderProps {
  tableName: string;
  columns: ColumnMeta[];
  onCreated: () => void;
}

const EXCLUDED = ["id", "created_at", "updated_at"];

export function CmsHeader({ tableName, columns, onCreated }: CmsHeaderProps) {
  const hasWritableColumns = columns.some((c) => !EXCLUDED.includes(c.name));

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold capitalize tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">{tableName}</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">Manage database records</p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{columns.length} columns</Badge>
      </div>
      {hasWritableColumns ? (
        <CreateModal tableName={tableName} columns={columns} onCreated={onCreated} />
      ) : null}
    </div>
  );
}
