import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, perPage, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <div className="flex items-center justify-between gap-4 px-1 py-3 text-sm text-gray-600">
      <div>
        Showing <span className="font-medium text-gray-900">{start}</span>–
        <span className="font-medium text-gray-900">{end}</span> of{" "}
        <span className="font-medium text-gray-900">{total}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex size-8 items-center justify-center rounded-md border border-gray-200 bg-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-50"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-xs text-gray-500">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex size-8 items-center justify-center rounded-md border border-gray-200 bg-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-50"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
