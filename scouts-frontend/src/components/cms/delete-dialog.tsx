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
          aria-label={`Delete ${tableName} record`}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Record</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this record from{" "}
            <strong>{tableName}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

