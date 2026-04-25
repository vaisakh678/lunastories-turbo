import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PagerProps {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pager({ page, perPage, total, onPageChange }: PagerProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <div className="flex items-center justify-between gap-4 px-1 py-4 text-sm">
      <div className="text-muted-foreground">
        Showing <span className="text-foreground font-medium">{start}</span>–
        <span className="text-foreground font-medium">{end}</span> of{" "}
        <span className="text-foreground font-medium">{total}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-muted-foreground text-xs">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
