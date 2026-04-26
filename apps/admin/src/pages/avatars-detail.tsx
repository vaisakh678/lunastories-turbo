import type { AvatarDTO, AvatarEventDTO } from "@repo/dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ChevronLeft, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

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
import { apiGet, http } from "@/lib/http";

export function AvatarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

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
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
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
              <div>
                <div className="text-lg font-semibold">{avatar.name ?? "—"}</div>
                <div className="text-muted-foreground font-mono text-xs">
                  {avatar.id}
                </div>
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
  const [name, setName] = useState("");
  const [setting, setSetting] = useState("");
  const [action, setAction] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setSetting("");
      setAction("");
      setTags("");
      setFile(null);
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [open]);

  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Pick a file first");
      const form = new FormData();
      form.append("file", file);
      if (name.trim()) form.append("name", name.trim());
      if (setting.trim()) form.append("setting", setting.trim());
      if (action.trim()) form.append("action", action.trim());
      if (tags.trim()) form.append("tags", tags.trim());
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
            A scene of this avatar in a specific setting. Used as a story
            illustration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="event-name">Name</Label>
              <Input
                id="event-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Running in jungle"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-setting">Setting</Label>
              <Input
                id="event-setting"
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
                placeholder="jungle, city, office…"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="event-action">Action</Label>
              <Input
                id="event-action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="running, sleeping…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-tags">Tags</Label>
              <Input
                id="event-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="outdoor, daytime"
              />
            </div>
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
            disabled={!file || upload.isPending}
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
    <div className="group relative overflow-hidden rounded-lg border bg-white">
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
