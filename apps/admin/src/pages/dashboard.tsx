import type { AdminStatsDTO } from "@repo/dto";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, MessageSquare, PersonStanding, Users } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { apiGet } from "@/lib/http";

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => apiGet<AdminStatsDTO>("/api/v1/admin/stats"),
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Dashboard"
        description="Overview of users, stories, and activity."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Users"
          value={data?.totalUsers}
          isLoading={isLoading}
        />
        <StatCard
          icon={BookOpen}
          label="Stories"
          value={data?.totalStories}
          isLoading={isLoading}
        />
        <StatCard
          icon={PersonStanding}
          label="Characters"
          value={data?.totalCharacters}
          isLoading={isLoading}
        />
        <StatCard
          icon={MessageSquare}
          label="Feedback"
          value={data?.totalFeedback}
          isLoading={isLoading}
        />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Stories by status
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatusCard label="Pending" value={data?.storiesByStatus.pending} tone="amber" />
          <StatusCard label="Generating" value={data?.storiesByStatus.generating} tone="blue" />
          <StatusCard label="Ready" value={data?.storiesByStatus.ready} tone="green" />
          <StatusCard label="Failed" value={data?.storiesByStatus.failed} tone="red" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  isLoading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | undefined;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <Icon className="size-4 text-gray-400" />
      </div>
      <div className="mt-3 text-3xl font-semibold text-gray-900">
        {isLoading ? "—" : (value ?? 0).toLocaleString()}
      </div>
    </div>
  );
}

const TONE = {
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  blue: "border-blue-200 bg-blue-50 text-blue-900",
  green: "border-green-200 bg-green-50 text-green-900",
  red: "border-red-200 bg-red-50 text-red-900",
} as const;

function StatusCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | undefined;
  tone: keyof typeof TONE;
}) {
  return (
    <div className={`rounded-lg border p-4 ${TONE[tone]}`}>
      <div className="text-xs font-medium opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-semibold">
        {(value ?? 0).toLocaleString()}
      </div>
    </div>
  );
}
