import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return dayjs(iso).format("MMM D, YYYY · h:mm A");
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  return dayjs(iso).fromNow();
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}
