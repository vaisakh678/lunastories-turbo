import type { AdminStatsDTO, UsagePeriodDTO } from "@repo/dto";
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
import { formatDuration } from "@/lib/format";
import { apiGet } from "@/lib/http";
import { estimateStoryCost, formatUsd } from "@/lib/openai-pricing";

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

      <Card>
        <CardHeader>
          <CardTitle>Usage & spend</CardTitle>
          <CardDescription>
            Estimated OpenAI cost based on stored token counts and audio
            duration. TTS values are derived; text gen tokens are exact.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || !data ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <UsageTile label="Today" usage={data.usage.today} />
              <UsageTile label="Last 7 days" usage={data.usage.last7Days} />
              <UsageTile label="Last 30 days" usage={data.usage.last30Days} />
              <UsageTile label="All time" usage={data.usage.allTime} highlight />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UsageTile({
  label,
  usage,
  highlight,
}: {
  label: string;
  usage: UsagePeriodDTO;
  highlight?: boolean;
}) {
  const cost = estimateStoryCost({
    textInputTokens: usage.textInputTokens,
    textOutputTokens: usage.textOutputTokens,
    audioInputChars: usage.audioInputChars,
    durationSeconds: usage.audioDurationSeconds,
  });
  return (
    <div
      className={
        highlight
          ? "border-primary/40 bg-primary/5 rounded-lg border p-4"
          : "rounded-lg border p-4"
      }
    >
      <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold tabular-nums">
        {formatUsd(cost.totalUsd)}
      </div>
      <div className="text-muted-foreground mt-3 space-y-1 text-xs">
        <Row label="Stories" value={usage.storiesCount.toLocaleString()} />
        <Row
          label="Text tokens"
          value={(usage.textInputTokens + usage.textOutputTokens).toLocaleString()}
        />
        <Row label="TTS chars" value={usage.audioInputChars.toLocaleString()} />
        <Row label="Audio" value={formatDuration(usage.audioDurationSeconds)} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span>{label}</span>
      <span className="text-foreground font-medium tabular-nums">{value}</span>
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
