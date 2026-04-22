import type { ComponentProps } from "react";
import { ApplicationStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusLabel } from "@/lib/application";

const statusStyles: Record<
  ApplicationStatus,
  { variant: ComponentProps<typeof Badge>["variant"]; className?: string }
> = {
  DRAFT: { variant: "outline" },
  SUBMITTED: { variant: "secondary" },
  UNDER_REVIEW: { variant: "default", className: "bg-sky-600 text-white" },
  APPROVED: { variant: "default", className: "bg-emerald-600 text-white" },
  REJECTED: { variant: "destructive" },
};

export function StatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  const style = statusStyles[status] ?? { variant: "secondary" };
  return (
    <Badge variant={style.variant} className={cn(style.className, className)}>
      {getStatusLabel(status)}
    </Badge>
  );
}
