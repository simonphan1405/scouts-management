"use client";

import { useCallback, useState } from "react";
import { Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteRecord } from "@/hooks/use-delete-record";
import { translateTableName } from "@/lib/i18n";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-client";
import { formatUserFriendlyMessage } from "@/lib/utils/error-formatter";

interface DeleteDialogProps {
  tableName: string;
  recordId: string;
  onDeleted: () => void;
}

export function DeleteDialog({
  tableName,
  recordId,
  onDeleted,
}: DeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { deleteRecord, loading } = useDeleteRecord(tableName);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setDeleteError(null);
    }
  }, []);

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      setDeleteError(null);

      try {
        await deleteRecord(recordId);
        toast.success(
          "Xóa thành công!",
          `Đã xóa bản ghi khỏi danh mục ${translateTableName(tableName)}.`,
        );
        setOpen(false);
        setDeleteError(null);
        onDeleted();
      } catch (err: unknown) {
        const isClientError =
          err instanceof ApiError ? err.isClientError : false;
        const friendlyMsg = formatUserFriendlyMessage(err, {
          action: "delete",
          tableName,
        });

        setDeleteError(friendlyMsg);

        if (isClientError) {
          toast.warning("Chưa thể xóa bản ghi", friendlyMsg);
        } else {
          toast.error("Không thể kết nối máy chủ", friendlyMsg);
        }
      }
    },
    [deleteRecord, onDeleted, recordId, tableName],
  );

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive cursor-pointer"
          aria-label={`Xóa bản ghi ${translateTableName(tableName)}`}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa bản ghi</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa bản ghi này khỏi{" "}
            <strong>{translateTableName(tableName)}</strong>? Hành động này
            không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {deleteError && (
          <div
            role="alert"
            className="p-3 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-in fade-in"
          >
            <AlertCircle
              className="h-4 w-4 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span className="flex-1 leading-relaxed">{deleteError}</span>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={loading}
            onClick={() => setDeleteError(null)}
            className="cursor-pointer"
          >
            Hủy
          </AlertDialogCancel>
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
          >
            {loading ? "Đang xóa…" : "Xóa"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
