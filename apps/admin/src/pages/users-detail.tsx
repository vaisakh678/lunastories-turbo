import type { AdminUserDTO } from "@repo/dto";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { apiGet } from "@/lib/http";

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => apiGet<AdminUserDTO>(`/api/v1/admin/users/${id}`),
    enabled: Boolean(id),
  });

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/users">
            <ChevronLeft className="size-4" />
            Back to users
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      ) : isError || !data ? (
        <p className="text-muted-foreground text-sm">Couldn't load this user.</p>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {data.name ?? data.email}
            </h1>
            <p className="text-muted-foreground text-sm">{data.email}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat
              label="Role"
              value={
                <Badge variant={data.role === "admin" ? "default" : "secondary"}>
                  {data.role}
                </Badge>
              }
            />
            <Stat label="Email verified" value={data.emailVerified ? "Yes" : "No"} />
            <Stat label="Stories" value={data.storyCount.toLocaleString()} />
            <Stat label="Characters" value={data.characterCount.toLocaleString()} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Identity</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <KV label="Clerk ID" value={data.clerkId} mono />
              <KV label="Joined" value={formatDate(data.createdAt)} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {label}
        </div>
        <div className="mt-1 text-base font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
        {label}
      </div>
      <div className={mono ? "mt-1 break-all font-mono text-xs" : "mt-1 text-sm"}>
        {value}
      </div>
    </div>
  );
}
