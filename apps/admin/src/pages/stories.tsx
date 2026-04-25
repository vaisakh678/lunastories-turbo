import type { PagedResponse, StorySummaryDTO } from "@repo/dto";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components/page-header";
import { Pager } from "@/components/pager";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePagination } from "@/hooks/use-pagination";
import { formatDuration, formatRelative } from "@/lib/format";
import { apiGet } from "@/lib/http";
import { serialNumber } from "@/lib/utils";

type StoryRow = StorySummaryDTO & { userId: string };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  ready: "default",
  pending: "secondary",
  generating: "secondary",
  failed: "destructive",
};

export function StoriesPage() {
  const { page, perPage, search, setPage, setSearch } = usePagination();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-stories", page, perPage, search],
    queryFn: () =>
      apiGet<PagedResponse<StoryRow>>("/api/v1/admin/stories", {
        page,
        perPage,
        search: search || undefined,
      }),
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Stories"
        description="All generated stories across users."
        actions={
          <div className="relative w-72">
            <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or summary…"
              className="pl-9"
            />
          </div>
        }
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
                  Loading…
                </TableCell>
              </TableRow>
            ) : (data?.items ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
                  No stories found.
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((s, i) => (
                <TableRow
                  key={s.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/stories/${s.id}`)}
                >
                  <TableCell className="text-muted-foreground text-sm">
                    {serialNumber(page, perPage, i)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{s.title ?? "Untitled"}</span>
                      {s.summary && (
                        <span className="text-muted-foreground line-clamp-1 text-xs">
                          {s.summary}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{s.modeKey}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[s.status] ?? "secondary"}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDuration(s.durationSeconds)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatRelative(s.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && (
        <Pager
          page={page}
          perPage={perPage}
          total={data.meta.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
