"use client";

import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
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
import { useCreateRecord } from "@/hooks/use-create-record";
import type { ColumnMeta } from "@/lib/graphql/types";

interface CreateModalProps {
  tableName: string;
  columns: ColumnMeta[];
  onCreated: () => void;
}

export function CreateModal({ tableName, columns, onCreated }: CreateModalProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const { createRecord, loading } = useCreateRecord(tableName, columns);

  const handleCancel = useCallback(() => setOpen(false), []);

  const handleSubmit = useCallback(async () => {
    await createRecord(values);
    setOpen(false);
    setValues({});
    onCreated();
  }, [createRecord, values, onCreated]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Record
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create {tableName} Record</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto min-h-0 py-1 pr-1">
          <RecordForm columns={columns} values={values} onChange={setValues} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating…" : "Create Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

