import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/current-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusLabel } from "@/lib/application";
import { FileTextIcon, UsersIcon, ListChecksIcon } from "lucide-react";

export default async function Page() {
  await requireAdmin();

  const [applicantsCount, applicationsCount, grouped] = await Promise.all([
    prisma.user.count({ where: { role: "APPLICANT" } }),
    prisma.application.count(),
    prisma.application.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Applicants</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <div className="text-3xl font-semibold">{applicantsCount}</div>
            <p className="text-sm text-muted-foreground">Registered applicants</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UsersIcon className="size-5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <div className="text-3xl font-semibold">{applicationsCount}</div>
            <p className="text-sm text-muted-foreground">Total applications</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileTextIcon className="size-5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Breakdown of all applications.
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ListChecksIcon className="size-5" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {grouped.map((g) => (
              <Badge key={g.status} variant="secondary">
                {getStatusLabel(g.status)}: {g._count._all}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
