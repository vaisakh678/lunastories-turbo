import type { PagedResponse, UserDTO } from "@repo/dto";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { DataTable, type Column } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/search-input";
import { formatRelative } from "@/lib/format";
import { apiGet } from "@/lib/http";
import { usePageState } from "@/lib/use-page-state";

const COLUMNS: Column<UserDTO>[] = [
  { key: "email", header: "Email", render: (u) => u.email },
  { key: "name", header: "Name", render: (u) => u.name ?? "—" },
  {
    key: "role",
    header: "Role",
    render: (u) => (
      <span
        className={
          u.role === "admin"
            ? "inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
            : "inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
        }
      >
        {u.role}
      </span>
    ),
  },
  {
    key: "verified",
    header: "Verified",
    render: (u) => (u.emailVerified ? "✓" : "—"),
  },
  {
    key: "joined",
    header: "Joined",
    className: "text-gray-500",
    render: (u) => formatRelative(u.createdAt),
  },
];

export function UsersPage() {
  const { page, perPage, search, setPage, setSearch } = usePageState();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, perPage, search],
    queryFn: () =>
      apiGet<PagedResponse<UserDTO>>("/api/v1/admin/users", {
        page,
        perPage,
        search: search || undefined,
      }),
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Users"
        description="Everyone who has signed in to Milo Tales."
        actions={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search email or name…"
          />
        }
      />

      <DataTable
        columns={COLUMNS}
        rows={data?.items ?? []}
        isLoading={isLoading}
        rowKey={(u) => u.id}
        onRowClick={(u) => navigate(`/users/${u.id}`)}
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
