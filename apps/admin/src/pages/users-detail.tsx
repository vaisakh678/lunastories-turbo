import type { AdminUserDTO } from "@repo/dto";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

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
    <div className="p-8">
      <Link
        to="/users"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ChevronLeft className="size-4" />
        Back to users
      </Link>

      {isLoading ? (
        <div className="text-gray-500">Loading…</div>
      ) : isError || !data ? (
        <div className="text-gray-500">Couldn't load this user.</div>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {data.name ?? data.email}
            </h1>
            <p className="text-sm text-gray-500">{data.email}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Role" value={data.role} />
            <Field label="Email verified" value={data.emailVerified ? "Yes" : "No"} />
            <Field label="Stories" value={data.storyCount.toLocaleString()} />
            <Field label="Characters" value={data.characterCount.toLocaleString()} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Clerk ID" value={data.clerkId} mono />
            <Field label="Joined" value={formatDate(data.createdAt)} />
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div
        className={
          mono
            ? "mt-1 break-all font-mono text-xs text-gray-800"
            : "mt-1 text-sm text-gray-800"
        }
      >
        {value}
      </div>
    </div>
  );
}
