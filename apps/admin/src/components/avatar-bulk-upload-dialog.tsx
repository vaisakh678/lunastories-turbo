import type { AvatarDTO } from "@repo/dto";
import axios from "axios";
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { http } from "@/lib/http";

type RowStatus =
  | { kind: "pending" }
  | { kind: "uploading" }
  | { kind: "done" }
  | { kind: "error"; message: string };

interface Row {
  file: File;
  status: RowStatus;
}

const ACCEPT = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
};
const MAX_BYTES = 4 * 1024 * 1024;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after all files finish (success or failed). */
  onCompleted: () => void;
}

export function AvatarBulkUploadDialog({ open, onOpenChange, onCompleted }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setRows([]);
      setIsUploading(false);
    }
  }, [open]);

  const dz = useDropzone({
    onDrop: (accepted: File[], rejections: FileRejection[]) => {
      const accepts: Row[] = accepted.map((f) => ({
        file: f,
        status: { kind: "pending" },
      }));
      const rejects: Row[] = rejections.map((r) => ({
        file: r.file,
        status: { kind: "error", message: r.errors[0]?.message ?? "Invalid" },
      }));
      setRows((prev) => [...prev, ...accepts, ...rejects]);
    },
    accept: ACCEPT,
    maxSize: MAX_BYTES,
    multiple: true,
    noClick: rows.length > 0, // outer dropzone is the surface; tile click is for the inline one
  });

  const pendingCount = rows.filter((r) => r.status.kind === "pending").length;
  const doneCount = rows.filter((r) => r.status.kind === "done").length;
  const failedCount = rows.filter((r) => r.status.kind === "error").length;
  const allFinished = rows.length > 0 && pendingCount === 0 && !isUploading;

  async function startUpload() {
    if (pendingCount === 0) return;
    setIsUploading(true);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      if (row.status.kind !== "pending") continue;

      setRows((prev) =>
        prev.map((r, idx) => (idx === i ? { ...r, status: { kind: "uploading" } } : r)),
      );

      try {
        const form = new FormData();
        form.append("file", row.file);
        const baseName = row.file.name.replace(/\.[^/.]+$/, "");
        if (baseName) form.append("name", baseName);

        await http.post<{ data: AvatarDTO }>(
          "/api/v1/admin/avatars",
          form,
          { headers: { "Content-Type": "multipart/form-data" } },
        );

        setRows((prev) =>
          prev.map((r, idx) => (idx === i ? { ...r, status: { kind: "done" } } : r)),
        );
      } catch (err) {
        setRows((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? { ...r, status: { kind: "error", message: extractMessage(err) } }
              : r,
          ),
        );
      }
    }

    setIsUploading(false);
    onCompleted();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !isUploading && onOpenChange(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk upload avatars</DialogTitle>
          <DialogDescription>
            Drop several images at once. Each file becomes its own avatar; the
            filename is used as the default name.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            {...dz.getRootProps()}
            className={cn(
              "bg-muted/30 hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center transition-colors",
              dz.isDragActive && "border-primary bg-primary/5",
            )}
          >
            <input {...dz.getInputProps()} />
            <ImagePlus className="text-muted-foreground size-8" />
            <div className="text-muted-foreground text-sm">
              {dz.isDragActive ? (
                <span className="text-primary font-medium">Drop images here</span>
              ) : (
                <>
                  <span className="text-foreground font-medium">Click to add files</span>{" "}
                  or drag &amp; drop multiple images.
                </>
              )}
            </div>
            <div className="text-muted-foreground text-xs">PNG / JPG / WebP up to 4 MB each</div>
          </div>

          {rows.length > 0 && (
            <div className="max-h-72 space-y-1 overflow-auto rounded-md border p-2">
              {rows.map((r, i) => (
                <RowItem
                  key={`${r.file.name}-${i}`}
                  row={r}
                  onRemove={
                    !isUploading && r.status.kind !== "uploading"
                      ? () => setRows((p) => p.filter((_, idx) => idx !== i))
                      : undefined
                  }
                />
              ))}
            </div>
          )}

          {rows.length > 0 && (
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>
                {rows.length} files · {doneCount} done · {failedCount} failed ·{" "}
                {pendingCount} pending
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            {allFinished ? "Done" : "Cancel"}
          </Button>
          <Button
            onClick={startUpload}
            disabled={pendingCount === 0 || isUploading}
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UploadCloud className="size-4" />
            )}
            Upload {pendingCount > 0 ? pendingCount : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RowItem({ row, onRemove }: { row: Row; onRemove?: () => void }) {
  return (
    <div className="hover:bg-muted/30 flex items-center gap-2 rounded px-2 py-1 text-sm">
      <StatusIcon status={row.status} />
      <span className="flex-1 truncate" title={row.file.name}>
        {row.file.name}
      </span>
      <span className="text-muted-foreground text-xs tabular-nums">
        {(row.file.size / 1024).toFixed(0)} KB
      </span>
      {row.status.kind === "error" && (
        <span className="text-destructive text-xs" title={row.status.message}>
          ⚠
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive ml-1 text-xs"
          aria-label="Remove"
        >
          ✕
        </button>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: RowStatus }) {
  switch (status.kind) {
    case "pending":
      return <span className="text-muted-foreground inline-block size-4 rounded-full border" />;
    case "uploading":
      return <Loader2 className="text-muted-foreground size-4 animate-spin" />;
    case "done":
      return <CheckCircle2 className="size-4 text-green-600" />;
    case "error":
      return <XCircle className="text-destructive size-4" />;
  }
}

function extractMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error ?? err.message;
  }
  if (err instanceof Error) return err.message;
  return "Upload failed";
}
