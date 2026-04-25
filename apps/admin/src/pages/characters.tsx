import type { CharacterDTO, PagedResponse } from "@repo/dto";
import { useQuery } from "@tanstack/react-query";

import { DataTable, type Column } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/search-input";
import { formatRelative } from "@/lib/format";
import { apiGet } from "@/lib/http";
import { usePageState } from "@/lib/use-page-state";

type CharacterRow = CharacterDTO & { userId: string };

const COLUMNS: Column<CharacterRow>[] = [
  {
    key: "name",
    header: "Name",
    render: (c) => <span className="font-medium text-gray-900">{c.name}</span>,
  },
  { key: "role", header: "Role", render: (c) => c.role },
  {
    key: "details",
    header: "Details",
    className: "text-gray-500",
    render: (c) => {
      const parts = [
        c.age != null ? `${c.age}y` : null,
        c.gender && c.gender !== "na" ? c.gender : null,
        c.hairColor,
      ].filter(Boolean);
      return parts.join(" · ") || "—";
    },
  },
  {
    key: "interests",
    header: "Interests",
    className: "text-gray-500",
    render: (c) => c.interests.slice(0, 3).join(", ") || "—",
  },
  {
    key: "created",
    header: "Created",
    className: "text-gray-500",
    render: (c) => formatRelative(c.createdAt),
  },
];

export function CharactersPage() {
  const { page, perPage, search, setPage, setSearch } = usePageState();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-characters", page, perPage, search],
    queryFn: () =>
      apiGet<PagedResponse<CharacterRow>>("/api/v1/admin/characters", {
        page,
        perPage,
        search: search || undefined,
      }),
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Characters"
        description="All characters across users."
        actions={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search character name…"
          />
        }
      />

      <DataTable
        columns={COLUMNS}
        rows={data?.items ?? []}
        isLoading={isLoading}
        rowKey={(c) => c.id}
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
