import type { FeedbackDTO, PagedResponse } from "@repo/dto";
import { useQuery } from "@tanstack/react-query";

import { DataTable, type Column } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/search-input";
import { formatRelative } from "@/lib/format";
import { apiGet } from "@/lib/http";
import { usePageState } from "@/lib/use-page-state";

type FeedbackRow = FeedbackDTO & { userId: string };

const CATEGORY_TONE: Record<string, string> = {
  bug: "bg-red-100 text-red-700",
  idea: "bg-yellow-100 text-yellow-800",
  praise: "bg-pink-100 text-pink-700",
  other: "bg-gray-100 text-gray-700",
};

const COLUMNS: Column<FeedbackRow>[] = [
  {
    key: "category",
    header: "Type",
    render: (f) => (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          CATEGORY_TONE[f.category] ?? "bg-gray-100 text-gray-700"
        }`}
      >
        {f.category}
      </span>
    ),
  },
  {
    key: "rating",
    header: "Rating",
    render: (f) => (f.rating ? `${f.rating} / 5` : "—"),
  },
  {
    key: "message",
    header: "Message",
    render: (f) => (
      <div className="line-clamp-2 max-w-xl text-gray-800">{f.message}</div>
    ),
  },
  {
    key: "created",
    header: "Sent",
    className: "text-gray-500",
    render: (f) => formatRelative(f.createdAt),
  },
];

export function FeedbackPage() {
  const { page, perPage, search, setPage, setSearch } = usePageState();

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
    <div className="p-8">
      <PageHeader
        title="Feedback"
        description="What users are telling us."
        actions={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search message…"
          />
        }
      />

      <DataTable
        columns={COLUMNS}
        rows={data?.items ?? []}
        isLoading={isLoading}
        rowKey={(f) => f.id}
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
