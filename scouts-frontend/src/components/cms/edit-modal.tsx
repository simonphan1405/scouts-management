"use client";

import { useCallback, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RecordForm } from "./record-form";
import { useUpdateRecord } from "@/hooks/use-update-record";
import type { ColumnMeta } from "@/lib/graphql/types";

interface EditModalProps {
  tableName: string;
  columns: ColumnMeta[];
  row: Record<string, unknown>;
  onUpdated: () => void;
}

export function EditModal({ tableName, columns, row, onUpdated }: EditModalProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>(row);
  const { updateRecord, loading } = useUpdateRecord(tableName, columns);

  const handleOpenChange = useCallback(
    (o: boolean) => {
      setOpen(o);
      if (o) setValues(row);
    },
    [row],
  );

  const handleSubmit = useCallback(async () => {
    await updateRecord(String(row.id), values);
    setOpen(false);
    onUpdated();
  }, [updateRecord, row.id, values, onUpdated]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Edit ${tableName} record`}>
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {tableName} Record</DialogTitle>
        </DialogHeader>
        <RecordForm columns={columns} values={values} onChange={setValues} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
