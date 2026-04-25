import type { FeedbackDTO, PagedResponse } from "@repo/dto";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

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
import { formatRelative } from "@/lib/format";
import { apiGet } from "@/lib/http";
import { serialNumber } from "@/lib/utils";

type FeedbackRow = FeedbackDTO & { userId: string };

const CATEGORY_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  bug: "destructive",
  idea: "default",
  praise: "secondary",
  other: "outline",
};

export function FeedbackPage() {
  const { page, perPage, search, setPage, setSearch } = usePagination();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-feedback", page, perPage, search],
    queryFn: () =>
      apiGet<PagedResponse<FeedbackRow>>("/api/v1/admin/feedback", {
        page,
        perPage,
        search: search || undefined,
      }),
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Feedback"
        description="What users are telling us."
        actions={
          <div className="relative w-72">
            <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search message…"
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
              <TableHead>Type</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Sent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                  Loading…
                </TableCell>
              </TableRow>
            ) : (data?.items ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                  No feedback yet.
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((f, i) => (
                <TableRow key={f.id}>
                  <TableCell className="text-muted-foreground text-sm">
                    {serialNumber(page, perPage, i)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={CATEGORY_VARIANT[f.category] ?? "outline"}>
                      {f.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {f.rating ? `${f.rating} / 5` : "—"}
                  </TableCell>
                  <TableCell className="max-w-xl">
                    <div className="line-clamp-2">{f.message}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatRelative(f.createdAt)}
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
