import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SimplePagination({
  page,
  totalPages,
  hrefForPage,
  className,
}: {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-2", className)}>
      <div className="text-sm text-muted-foreground">
        Page <span className="font-medium text-foreground">{page}</span> of{" "}
        <span className="font-medium text-foreground">{totalPages}</span>
      </div>
      <div className="flex items-center gap-2">
        {prev ? (
          <Button asChild size="sm" variant="outline">
            <Link href={hrefForPage(prev)}>Previous</Link>
          </Button>
        ) : (
          <Button size="sm" variant="outline" disabled>
            Previous
          </Button>
        )}

        {next ? (
          <Button asChild size="sm" variant="outline">
            <Link href={hrefForPage(next)}>Next</Link>
          </Button>
        ) : (
          <Button size="sm" variant="outline" disabled>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}

