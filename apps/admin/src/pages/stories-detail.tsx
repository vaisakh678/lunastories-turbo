import type { StoryDTO } from "@repo/dto";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { formatDate, formatDuration } from "@/lib/format";
import { apiGet } from "@/lib/http";

export function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-story", id],
    queryFn: () => apiGet<StoryDTO>(`/api/v1/admin/stories/${id}`),
    enabled: Boolean(id),
  });

  return (
    <div className="p-8">
      <Link
        to="/stories"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ChevronLeft className="size-4" />
        Back to stories
      </Link>

      {isLoading ? (
        <div className="text-gray-500">Loading…</div>
      ) : isError || !data ? (
        <div className="text-gray-500">Couldn't load this story.</div>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {data.title ?? "Untitled"}
            </h1>
            {data.summary && (
              <p className="mt-1 text-sm text-gray-600">{data.summary}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Mode" value={data.modeKey} />
            <Field label="Status" value={data.status} />
            <Field label="Duration" value={formatDuration(data.durationSeconds)} />
            <Field label="Created" value={formatDate(data.createdAt)} />
          </div>

          {data.audioUrl && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Audio
              </h2>
              <audio controls src={data.audioUrl} className="w-full" />
            </section>
          )}

          {data.errorMessage && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-600">
                Error
              </h2>
              <pre className="whitespace-pre-wrap rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                {data.errorMessage}
              </pre>
            </section>
          )}

          {data.bodyText && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Story text
              </h2>
              <div className="whitespace-pre-wrap rounded-md border border-gray-200 bg-white p-5 text-sm leading-relaxed text-gray-800">
                {data.bodyText}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Generation input
            </h2>
            <pre className="overflow-auto rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800">
              {JSON.stringify(data.generationInput, null, 2)}
            </pre>
          </section>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-sm text-gray-800">{value}</div>
    </div>
  );
}
