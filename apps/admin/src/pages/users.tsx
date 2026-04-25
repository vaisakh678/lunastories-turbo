import type { PagedResponse, UserDTO } from "@repo/dto";
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
import { formatRelative } from "@/lib/format";
import { apiGet } from "@/lib/http";
import { serialNumber } from "@/lib/utils";

export function UsersPage() {
  const { page, perPage, search, setPage, setSearch } = usePagination();
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
    <div className="space-y-4">
      <PageHeader
        title="Users"
        description="Everyone who has signed in to Milo Tales."
        actions={
          <div className="relative w-72">
            <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email or name…"
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
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Joined</TableHead>
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
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((u, i) => (
                <TableRow
                  key={u.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/users/${u.id}`)}
                >
                  <TableCell className="text-muted-foreground text-sm">
                    {serialNumber(page, perPage, i)}
                  </TableCell>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell>{u.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{u.emailVerified ? "✓" : "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatRelative(u.createdAt)}
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
