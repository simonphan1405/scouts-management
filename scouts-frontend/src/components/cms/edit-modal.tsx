"use client";

import { useCallback, useState } from "react";
import { Pencil, AlertCircle } from "lucide-react";
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
import { translateField, translateTableName } from "@/lib/i18n";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-client";
import { formatUserFriendlyMessage } from "@/lib/utils/error-formatter";

interface EditModalProps {
  tableName: string;
  columns: ColumnMeta[];
  row: Record<string, unknown>;
  onUpdated: () => void;
}

const EXCLUDED_FIELDS = ["id", "created_at", "updated_at", "nodeId"];

export function EditModal({
  tableName,
  columns,
  row,
  onUpdated,
}: EditModalProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>(row);
  const [formError, setFormError] = useState<string | null>(null);
  const { updateRecord, loading } = useUpdateRecord(tableName);

  const handleOpenChange = useCallback(
    (o: boolean) => {
      setOpen(o);
      setFormError(null);
      if (o) setValues(row);
    },
    [row],
  );

  const handleSubmit = useCallback(async () => {
    setFormError(null);

    // 1. Kiểm tra xác thực (Validation) các trường bắt buộc
    const missingFields = columns
      .filter((col) => !col.nullable && !EXCLUDED_FIELDS.includes(col.name))
      .filter((col) => {
        const val = values[col.name];
        return val === undefined || val === null || String(val).trim() === "";
      });

    if (missingFields.length > 0) {
      const fieldLabels = missingFields
        .map((f) => translateField(f.name))
        .join(", ");
      const msg = `Vui lòng nhập đầy đủ các thông tin bắt buộc (*): ${fieldLabels}`;
      setFormError(msg);
      toast.warning("Chưa thể lưu thay đổi", msg);
      return;
    }

    // 2. Thực hiện cập nhật bản ghi
    try {
      await updateRecord(String(row.id), values);
      toast.success(
        "Cập nhật thành công!",
        `Đã lưu thay đổi cho bản ghi trong danh mục ${translateTableName(tableName)}.`,
      );
      setOpen(false);
      setFormError(null);
      onUpdated();
    } catch (err: unknown) {
      const isClientError = err instanceof ApiError ? err.isClientError : false;
      const friendlyMsg = formatUserFriendlyMessage(err, {
        action: "update",
        tableName,
      });

      setFormError(friendlyMsg);

      if (isClientError) {
        toast.warning("Chưa thể lưu thay đổi", friendlyMsg);
      } else {
        toast.error("Không thể kết nối máy chủ", friendlyMsg);
      }
    }
  }, [columns, onUpdated, row.id, tableName, updateRecord, values]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 cursor-pointer"
          aria-label={`Chỉnh sửa bản ghi ${translateTableName(tableName)}`}
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90dvh] w-[calc(100vw-1.5rem)] flex flex-col p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>
            Chỉnh sửa bản ghi: {translateTableName(tableName)}
          </DialogTitle>
        </DialogHeader>

        {formError && (
          <div
            role="alert"
            className="p-3 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-in fade-in"
          >
            <AlertCircle
              className="h-4 w-4 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span className="flex-1 leading-relaxed">{formError}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-0 py-1 pr-1">
          <RecordForm
            tableName={tableName}
            columns={columns}
            values={values}
            onChange={(next) => {
              setValues(next);
              if (formError) setFormError(null);
            }}
          />
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto cursor-pointer"
          >
            {loading ? "Đang lưu…" : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
