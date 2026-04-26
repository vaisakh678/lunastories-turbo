import type { AvatarDTO } from "@repo/dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet, http } from "@/lib/http";

export function AvatarsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const list = useQuery({
    queryKey: ["admin-avatars"],
    queryFn: () =>
      apiGet<AvatarDTO[]>("/api/v1/admin/avatars", { includeDisabled: "true" }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await http.delete(`/api/v1/admin/avatars/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-avatars"] }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Avatars"
        description="Character avatars used in the iOS app's icon picker."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Upload
          </Button>
        }
      />

      <UploadAvatarDialog
        open={open}
        onOpenChange={setOpen}
        onUploaded={() => {
          setOpen(false);
          qc.invalidateQueries({ queryKey: ["admin-avatars"] });
        }}
      />

      <div>
        <h2 className="text-muted-foreground mb-3 text-sm font-semibold uppercase tracking-wide">
          {list.data ? `${list.data.length} avatars` : "Avatars"}
        </h2>

        {list.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full" />
            ))}
          </div>
        ) : (list.data ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No avatars yet — click Upload to add one.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {list.data?.map((a) => (
              <AvatarTile
                key={a.id}
                avatar={a}
                onOpen={() => navigate(`/avatars/${a.id}`)}
                onDelete={() => {
                  if (confirm(`Delete "${a.name ?? "this avatar"}"?`)) {
                    del.mutate(a.id);
                  }
                }}
                isDeleting={del.isPending && del.variables === a.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UploadAvatarDialog({
  open,
  onOpenChange,
  onUploaded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset whenever the dialog re-opens
  useEffect(() => {
    if (open) {
      setName("");
      setFile(null);
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [open]);

  const upload = useMutation({
    mutationFn: async (args: { file: File; name: string }) => {
      const form = new FormData();
      form.append("file", args.file);
      if (args.name.trim()) form.append("name", args.name.trim());
      const res = await http.post<{ data: AvatarDTO }>(
        "/api/v1/admin/avatars",
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return res.data.data;
    },
    onSuccess: () => onUploaded(),
    onError: (err) => setError(extractMessage(err)),
  });

  const previewUrl = file ? URL.createObjectURL(file) : null;
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload avatar</DialogTitle>
          <DialogDescription>
            PNG, JPG, or WebP up to 4 MB. Square images look best.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="avatar-name">Name (optional)</Label>
            <Input
              id="avatar-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sleepy Fox"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar-file">Image</Label>
            <Input
              id="avatar-file"
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setError(null);
              }}
            />
          </div>

          {previewUrl && (
            <div className="flex justify-center">
              <div className="bg-muted/30 flex size-32 items-center justify-center overflow-hidden rounded-md border">
                <img
                  src={previewUrl}
                  alt="preview"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          )}

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
            disabled={upload.isPending}
          >
            Cancel
          </Button>
          <Button
            disabled={!file || upload.isPending}
            onClick={() => {
              if (!file) return;
              upload.mutate({ file, name });
            }}
          >
            {upload.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AvatarTile({
  avatar,
  onOpen,
  onDelete,
  isDeleting,
}: {
  avatar: AvatarDTO;
  onOpen: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="group bg-card relative overflow-hidden rounded-lg border">
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left"
      >
        <div className="bg-muted/30 relative flex aspect-square items-center justify-center">
          <img
            src={avatar.url}
            alt={avatar.name ?? "avatar"}
            className={
              avatar.isEnabled
                ? "h-full w-full object-contain"
                : "h-full w-full object-contain opacity-40"
            }
            loading="lazy"
          />
        </div>
        <div className="flex items-center justify-between gap-2 border-t p-2">
          <div className="truncate text-xs font-medium" title={avatar.name ?? avatar.id}>
            {avatar.name ?? "—"}
          </div>
          <Badge variant={avatar.isEnabled ? "default" : "secondary"} className="text-[10px]">
            {avatar.isEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </button>
      <Button
        variant="destructive"
        size="icon"
        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        disabled={isDeleting}
      >
        {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
      </Button>
    </div>
  );
}

function extractMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error ?? err.message;
  }
  if (err instanceof Error) return err.message;
  return "Upload failed";
}
