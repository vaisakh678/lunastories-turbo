import type { AdminStatsDTO } from "@repo/dto";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, MessageSquare, PersonStanding, Users } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/http";

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => apiGet<AdminStatsDTO>("/api/v1/admin/stats"),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of users, stories, and activity."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Users" value={data?.totalUsers} isLoading={isLoading} />
        <StatCard icon={BookOpen} label="Stories" value={data?.totalStories} isLoading={isLoading} />
        <StatCard icon={PersonStanding} label="Characters" value={data?.totalCharacters} isLoading={isLoading} />
        <StatCard icon={MessageSquare} label="Feedback" value={data?.totalFeedback} isLoading={isLoading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stories by status</CardTitle>
          <CardDescription>How generation is going across the table.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatusTile label="Pending" value={data?.storiesByStatus.pending} tone="amber" isLoading={isLoading} />
            <StatusTile label="Generating" value={data?.storiesByStatus.generating} tone="blue" isLoading={isLoading} />
            <StatusTile label="Ready" value={data?.storiesByStatus.ready} tone="green" isLoading={isLoading} />
            <StatusTile label="Failed" value={data?.storiesByStatus.failed} tone="red" isLoading={isLoading} />
          </div>
        </CardContent>
      </Card>
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">{label}</CardTitle>
        <Icon className="text-muted-foreground size-4" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-3xl font-bold">{(value ?? 0).toLocaleString()}</div>
        )}
      </CardContent>
    </Card>
  );
}

const TONE: Record<string, string> = {
  amber: "border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900",
  blue: "border-blue-200 bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900",
  green: "border-green-200 bg-green-50 text-green-900 dark:bg-green-950/40 dark:text-green-200 dark:border-green-900",
  red: "border-red-200 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900",
};

function StatusTile({
  label,
  value,
  tone,
  isLoading,
}: {
  label: string;
  value: number | undefined;
  tone: keyof typeof TONE;
  isLoading: boolean;
}) {
  return (
    <div className={`rounded-lg border p-4 ${TONE[tone]}`}>
      <div className="text-xs font-medium opacity-80">{label}</div>
      {isLoading ? (
        <Skeleton className="mt-2 h-7 w-12" />
      ) : (
        <div className="mt-1 text-2xl font-bold">{(value ?? 0).toLocaleString()}</div>
      )}
    </div>
  );
}
