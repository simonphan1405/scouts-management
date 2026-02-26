"use client";

import { EditModal } from "./edit-modal";
import { DeleteDialog } from "./delete-dialog";
import type { ColumnMeta } from "@/lib/graphql/types";

interface RowActionsProps {
  tableName: string;
  columns: ColumnMeta[];
  row: Record<string, unknown>;
  onRefetch: () => void;
}

export function RowActions({ tableName, columns, row, onRefetch }: RowActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <EditModal
        tableName={tableName}
        columns={columns}
        row={row}
        onUpdated={onRefetch}
      />
      <DeleteDialog
        tableName={tableName}
        recordId={String(row.id)}
        onDeleted={onRefetch}
      />
    </div>
  );
}
