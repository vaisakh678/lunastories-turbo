import type { PagedResponse, StorySummaryDTO } from "@repo/dto";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { DataTable, type Column } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/search-input";
import { formatDuration, formatRelative } from "@/lib/format";
import { apiGet } from "@/lib/http";
import { usePageState } from "@/lib/use-page-state";

type StoryRow = StorySummaryDTO & { userId: string };

const STATUS_TONE: Record<string, string> = {
  ready: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  generating: "bg-blue-100 text-blue-700",
  failed: "bg-red-100 text-red-700",
};

const COLUMNS: Column<StoryRow>[] = [
  {
    key: "title",
    header: "Title",
    render: (s) => (
      <div className="flex flex-col">
        <span className="font-medium text-gray-900">{s.title ?? "Untitled"}</span>
        {s.summary && (
          <span className="line-clamp-1 text-xs text-gray-500">{s.summary}</span>
        )}
      </div>
    ),
  },
  { key: "mode", header: "Mode", render: (s) => s.modeKey },
  {
    key: "status",
    header: "Status",
    render: (s) => (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          STATUS_TONE[s.status] ?? "bg-gray-100 text-gray-700"
        }`}
      >
        {s.status}
      </span>
    ),
  },
  {
    key: "duration",
    header: "Duration",
    className: "text-gray-500",
    render: (s) => formatDuration(s.durationSeconds),
  },
  {
    key: "created",
    header: "Created",
    className: "text-gray-500",
    render: (s) => formatRelative(s.createdAt),
  },
];

export function StoriesPage() {
  const { page, perPage, search, setPage, setSearch } = usePageState();
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
    <div className="p-8">
      <PageHeader
        title="Stories"
        description="All generated stories across users."
        actions={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search title or summary…"
          />
        }
      />

      <DataTable
        columns={COLUMNS}
        rows={data?.items ?? []}
        isLoading={isLoading}
        rowKey={(s) => s.id}
        onRowClick={(s) => navigate(`/stories/${s.id}`)}
      />

      {data && (
        <Pagination
          page={page}
          perPage={perPage}
          total={data.meta.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
