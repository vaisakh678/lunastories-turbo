import type { AvatarDTO } from "@repo/dto";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ImageIcon, Loader2, Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { http } from "@/lib/http";

const ACCEPT = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
};
const MAX_BYTES = 4 * 1024 * 1024;

interface Props {
  /** When provided the dialog is in "edit" mode; otherwise "create". */
  avatar?: AvatarDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (avatar: AvatarDTO) => void;
}

export function AvatarFormDialog({ avatar, open, onOpenChange, onSaved }: Props) {
  const isEdit = avatar !== undefined;

  const [name, setName] = useState(avatar?.name ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(avatar?.name ?? "");
      setFile(null);
      setError(null);
    }
  }, [open, avatar?.name]);

  const onDrop = (accepted: File[], rejections: FileRejection[]) => {
    setError(null);
    if (rejections[0]) {
      setError(rejections[0].errors[0]?.message ?? "Invalid file");
      return;
    }
    if (accepted[0]) setFile(accepted[0]);
  };

  const dz = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxFiles: 1,
    maxSize: MAX_BYTES,
    multiple: false,
  });

  const previewUrl = file
    ? URL.createObjectURL(file)
    : avatar?.url ?? null;
  useEffect(() => {
    return () => {
      if (file && previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [file, previewUrl]);

  const save = useMutation({
    mutationFn: async () => {
      const trimmed = name.trim();
      const form = new FormData();

      if (isEdit) {
        const nameChanged = trimmed !== (avatar.name ?? "");
        if (!nameChanged && !file) {
          throw new Error("Nothing to update");
        }
        if (nameChanged) form.append("name", trimmed);
        if (file) form.append("file", file);

        const res = await http.patch<{ data: AvatarDTO }>(
          `/api/v1/admin/avatars/${avatar.id}`,
          form,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        return res.data.data;
      }

      if (!file) throw new Error("Pick an image first");
      form.append("file", file);
      if (trimmed) form.append("name", trimmed);

      const res = await http.post<{ data: AvatarDTO }>(
        "/api/v1/admin/avatars",
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return res.data.data;
    },
    onSuccess: (a) => onSaved(a),
    onError: (err) => setError(extractMessage(err)),
  });

  const canSave = isEdit
    ? Boolean(file) || name.trim() !== (avatar?.name ?? "")
    : Boolean(file);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit avatar" : "Upload avatar"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Rename or replace the image. Leave the dropzone empty to keep the existing image."
              : "PNG, JPG, or WebP up to 4 MB. Square images look best."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div
              {...dz.getRootProps()}
              className={cn(
                "group bg-muted/30 hover:bg-muted/50 relative flex size-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed transition-colors",
                dz.isDragActive && "border-primary bg-primary/5",
              )}
            >
              <input {...dz.getInputProps()} />
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                    Replace
                  </div>
                </>
              ) : (
                <ImageIcon className="text-muted-foreground size-8" />
              )}
            </div>
            <div className="text-muted-foreground text-xs">
              {dz.isDragActive ? (
                <span className="text-primary font-medium">Drop image here</span>
              ) : (
                <>
                  <span className="text-foreground font-medium">Click to browse</span>{" "}
                  or drag &amp; drop a PNG / JPG / WebP up to 4 MB.
                </>
              )}
              {file && (
                <div className="mt-1">
                  {file.name} · {(file.size / 1024).toFixed(0)} KB
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar-form-name">Name (optional)</Label>
            <Input
              id="avatar-form-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sleepy Fox"
            />
          </div>

          {error && (
            <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-3 text-sm">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={save.isPending}
          >
            Cancel
          </Button>
          <Button onClick={() => save.mutate()} disabled={!canSave || save.isPending}>
            {save.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            {isEdit ? "Save" : "Add avatar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function extractMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error ?? err.message;
  }
  if (err instanceof Error) return err.message;
  return "Save failed";
}
