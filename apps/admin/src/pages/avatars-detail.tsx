import type { AvatarDTO, AvatarEventDTO } from "@repo/dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ChevronLeft, Loader2, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { AvatarFormDialog } from "@/components/avatar-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { EVENT_PRESETS, presetByKey } from "@/lib/event-presets";
import { apiGet, http } from "@/lib/http";

export function AvatarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const avatars = useQuery({
    queryKey: ["admin-avatars"],
    queryFn: () =>
      apiGet<AvatarDTO[]>("/api/v1/admin/avatars", { includeDisabled: "true" }),
  });
  const avatar = avatars.data?.find((a) => a.id === id);

  const events = useQuery({
    queryKey: ["admin-avatar-events", id],
    queryFn: () =>
      apiGet<AvatarEventDTO[]>(`/api/v1/admin/avatars/${id}/events`, {
        includeDisabled: "true",
      }),
    enabled: Boolean(id),
  });

  const del = useMutation({
    mutationFn: async (eventId: string) => {
      await http.delete(`/api/v1/admin/avatars/${id}/events/${eventId}`);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-avatar-events", id] }),
  });

  const toggleEnabled = useMutation({
    mutationFn: async (isEnabled: boolean) => {
      const res = await http.patch<{ data: AvatarDTO }>(
        `/api/v1/admin/avatars/${id}`,
        { isEnabled },
      );
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-avatars"] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/avatars">
            <ChevronLeft className="size-4" />
            Back to avatars
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Avatar</CardTitle>
          {avatar && (
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {avatars.isLoading || !avatar ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="flex items-center gap-4">
              <div className="bg-muted/30 size-20 overflow-hidden rounded-md border">
                <img
                  src={avatar.url}
                  alt={avatar.name ?? "avatar"}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="text-lg font-semibold">{avatar.name ?? "—"}</div>
                <div className="text-muted-foreground font-mono text-xs">
                  {avatar.id}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="avatar-enabled" className="text-sm">
                  {avatar.isEnabled ? "Enabled" : "Disabled"}
                </Label>
                <Switch
                  id="avatar-enabled"
                  checked={avatar.isEnabled}
                  disabled={toggleEnabled.isPending}
                  onCheckedChange={(v) => toggleEnabled.mutate(v)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Events</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Variations of this character in different settings, used as story
            illustrations.
          </p>
        </div>
        <Button onClick={() => setOpen(true)} disabled={!avatar}>
          <Plus className="size-4" />
          Upload event
        </Button>
      </div>

      {avatar && (
        <UploadEventDialog
          open={open}
          avatarId={avatar.id}
          onOpenChange={setOpen}
          onUploaded={() => {
            setOpen(false);
            qc.invalidateQueries({ queryKey: ["admin-avatar-events", id] });
          }}
        />
      )}

      {avatar && (
        <AvatarFormDialog
          avatar={avatar}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSaved={() => {
            setEditOpen(false);
            qc.invalidateQueries({ queryKey: ["admin-avatars"] });
          }}
        />
      )}

      {events.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      ) : (events.data ?? []).length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No events yet — click Upload event to add one.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {events.data?.map((e) => (
            <EventTile
              key={e.id}
              event={e}
              onDelete={() => {
                if (confirm(`Delete "${e.name ?? "this event"}"?`)) {
                  del.mutate(e.id);
                }
              }}
              isDeleting={del.isPending && del.variables === e.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UploadEventDialog({
  avatarId,
  open,
  onOpenChange,
  onUploaded,
}: {
  avatarId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [presetKey, setPresetKey] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPresetKey("");
      setFile(null);
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [open]);

  const preset = presetByKey(presetKey);

  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Pick a file first");
      if (!preset) throw new Error("Pick an event type");
      const form = new FormData();
      form.append("file", file);
      form.append("name", preset.label);
      form.append("setting", preset.setting);
      form.append("action", preset.action);
      form.append("tags", preset.tags.join(","));
      const res = await http.post<{ data: AvatarEventDTO }>(
        `/api/v1/admin/avatars/${avatarId}/events`,
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
          <DialogTitle>Upload event</DialogTitle>
          <DialogDescription>
            Pick an event type, then upload the matching scene image.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-preset">Event type</Label>
            <select
              id="event-preset"
              value={presetKey}
              onChange={(e) => setPresetKey(e.target.value)}
              className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-colors focus-visible:ring-1 focus-visible:outline-none"
            >
              <option value="">Select an event type…</option>
              {EVENT_PRESETS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
            {preset && (
              <div className="text-muted-foreground text-xs">
                Tags: {preset.tags.join(", ")}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-file">Image (PNG / JPG / WebP, ≤4MB)</Label>
            <Input
              id="event-file"
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
            disabled={!file || !preset || upload.isPending}
            onClick={() => upload.mutate()}
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

function EventTile({
  event,
  onDelete,
  isDeleting,
}: {
  event: AvatarEventDTO;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="group bg-card relative overflow-hidden rounded-lg border">
      <div className="bg-muted/30 flex aspect-square items-center justify-center">
        <img
          src={event.url}
          alt={event.name ?? "event"}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      </div>
      <div className="space-y-1 border-t p-2">
        <div className="truncate text-xs font-medium" title={event.name ?? event.id}>
          {event.name ?? "—"}
        </div>
        <div className="flex flex-wrap gap-1">
          {event.setting && (
            <Badge variant="secondary" className="text-[10px]">
              {event.setting}
            </Badge>
          )}
          {event.action && (
            <Badge variant="outline" className="text-[10px]">
              {event.action}
            </Badge>
          )}
        </div>
      </div>
      <Button
        variant="destructive"
        size="icon"
        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={onDelete}
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
