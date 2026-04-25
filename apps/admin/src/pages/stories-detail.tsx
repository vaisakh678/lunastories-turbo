import type { StoryDTO } from "@repo/dto";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatDuration } from "@/lib/format";
import { apiGet } from "@/lib/http";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  ready: "default",
  pending: "secondary",
  generating: "secondary",
  failed: "destructive",
};

export function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-story", id],
    queryFn: () => apiGet<StoryDTO>(`/api/v1/admin/stories/${id}`),
    enabled: Boolean(id),
  });

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/stories">
            <ChevronLeft className="size-4" />
            Back to stories
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : isError || !data ? (
        <p className="text-muted-foreground text-sm">Couldn't load this story.</p>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {data.title ?? "Untitled"}
            </h1>
            {data.summary && (
              <p className="text-muted-foreground mt-1 text-sm">{data.summary}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Mode" value={data.modeKey} />
            <Stat
              label="Status"
              value={
                <Badge variant={STATUS_VARIANT[data.status] ?? "secondary"}>
                  {data.status}
                </Badge>
              }
            />
            <Stat label="Duration" value={formatDuration(data.durationSeconds)} />
            <Stat label="Created" value={formatDate(data.createdAt)} />
          </div>

          {data.audioUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Audio</CardTitle>
              </CardHeader>
              <CardContent>
                <audio controls src={data.audioUrl} className="w-full" />
              </CardContent>
            </Card>
          )}

          {data.errorMessage && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-destructive whitespace-pre-wrap text-xs">
                  {data.errorMessage}
                </pre>
              </CardContent>
            </Card>
          )}

          {data.bodyText && (
            <Card>
              <CardHeader>
                <CardTitle>Story text</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {data.bodyText}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Generation input</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted overflow-auto rounded-md p-3 text-xs">
                {JSON.stringify(data.generationInput, null, 2)}
              </pre>
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
