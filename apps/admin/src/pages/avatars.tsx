import type { AvatarDTO } from "@repo/dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { AvatarFormDialog } from "@/components/avatar-form-dialog";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet, http } from "@/lib/http";

export function AvatarsPage() {
  const qc = useQueryClient();
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
            Add avatar
          </Button>
        }
      />

      <AvatarFormDialog
        open={open}
        onOpenChange={setOpen}
        onSaved={() => {
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

function AvatarTile({
  avatar,
  onDelete,
  isDeleting,
}: {
  avatar: AvatarDTO;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="group bg-card relative overflow-hidden rounded-lg border">
      <Link to={`/avatars/${avatar.id}`} className="block w-full text-left">
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
      </Link>
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
