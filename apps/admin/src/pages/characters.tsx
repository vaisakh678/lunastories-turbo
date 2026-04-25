import type { CharacterDTO, PagedResponse } from "@repo/dto";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Pager } from "@/components/pager";
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

type CharacterRow = CharacterDTO & { userId: string };

export function CharactersPage() {
  const { page, perPage, search, setPage, setSearch } = usePagination();

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
    <div className="space-y-4">
      <PageHeader
        title="Characters"
        description="All characters across users."
        actions={
          <div className="relative w-72">
            <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search character name…"
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
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Interests</TableHead>
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
                  No characters found.
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((c, i) => {
                const details = [
                  c.age != null ? `${c.age}y` : null,
                  c.gender && c.gender !== "na" ? c.gender : null,
                  c.hairColor,
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <TableRow key={c.id}>
                    <TableCell className="text-muted-foreground text-sm">
                      {serialNumber(page, perPage, i)}
                    </TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{c.role}</TableCell>
                    <TableCell className="text-muted-foreground">{details || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.interests.slice(0, 3).join(", ") || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatRelative(c.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })
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
