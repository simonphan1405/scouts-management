"use client";

import { useCallback, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
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

interface DeleteDialogProps {
  tableName: string;
  recordId: string;
  onDeleted: () => void;
}

export function DeleteDialog({ tableName, recordId, onDeleted }: DeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const { deleteRecord, loading } = useDeleteRecord(tableName);

  const handleDelete = useCallback(async () => {
    await deleteRecord(recordId);
    setOpen(false);
    onDeleted();
  }, [deleteRecord, recordId, onDeleted]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
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
            <strong>{translateTableName(tableName)}</strong>? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Đang xóa…" : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

