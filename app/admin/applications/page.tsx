import Link from "next/link";
import { requireAdmin } from "@/lib/auth/current-user";
import { getPrismaDelegate, hasFunction } from "@/lib/prisma-delegates";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { SimplePagination } from "@/components/simple-pagination";
import { bulkUpdateApplicationStatus } from "@/app/actions/admin";
import { Label } from "@/components/ui/label";

type ApplicationRow = {
  id: number;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  submittedAt: Date | null;
  updatedAt: Date;
  course: { title: string } | null;
  user: { fullName: string; email: string };
};

function PrismaNotReadyCard({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Stop <code>npm run dev</code>, then run <code>npm run prisma:push</code>{" "}
        and <code>npm run prisma:generate</code>.
      </CardContent>
    </Card>
  );
}

function parsePage(value: unknown) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string; updated?: string; error?: string };
}) {
  await requireAdmin();

  const applicationDelegate = getPrismaDelegate("application");
  if (!hasFunction(applicationDelegate, "findMany")) {
    return <PrismaNotReadyCard title="Prisma Client not updated" />;
  }

  const pageSize = 10;
  const page = parsePage(searchParams.page);
  const skip = (page - 1) * pageSize;

  let applications: ApplicationRow[] = [];
  let total = 0;
  try {
    [applications, total] = await Promise.all([
      (applicationDelegate.findMany({
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          status: true,
          course: { select: { title: true } },
          submittedAt: true,
          updatedAt: true,
          user: { select: { fullName: true, email: true } },
        },
      }) as unknown as Promise<ApplicationRow[]>),
      prisma.application.count(),
    ]);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      return <PrismaNotReadyCard title="Database not ready" />;
    }
    if (error instanceof Error && error.message.includes("Unknown arg")) {
      return <PrismaNotReadyCard title="Prisma Client not updated" />;
    }
    throw error;
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const updatedCount = Number(searchParams.updated);
  const hasError = searchParams.error === "1";

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="grid gap-1">
              <CardTitle>Applications</CardTitle>
              <CardDescription>View submissions and review status.</CardDescription>
            </div>
            <Badge variant="secondary">{applications.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {Number.isFinite(updatedCount) && updatedCount > 0 ? (
            <div className="rounded-xl border bg-muted/20 p-3 text-sm">
              Updated <span className="font-medium">{updatedCount}</span>{" "}
              application{updatedCount === 1 ? "" : "s"}.
            </div>
          ) : null}
          {hasError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              Select at least one application before updating.
            </div>
          ) : null}

          <form action={bulkUpdateApplicationStatus} className="grid gap-4">
            <input type="hidden" name="redirectTo" value={`/admin/applications?page=${page}`} />

            <div className="grid gap-2 md:grid-cols-3 md:items-end">
              <div className="grid gap-2">
                <Label htmlFor="bulkStatus">Change status (single or bulk)</Label>
                <select
                  id="bulkStatus"
                  name="status"
                  defaultValue="UNDER_REVIEW"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="bulkAdminNote">Admin note (optional)</Label>
                <input
                  id="bulkAdminNote"
                  name="adminNote"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Applies to all selected applications"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-muted-foreground">
                Tick rows below, then click Update.
              </div>
              <Button type="submit" size="sm">
                Update selected
              </Button>
            </div>

            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Sel</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          name="applicationIds"
                          value={app.id}
                          className="h-4 w-4 rounded border border-input bg-background align-middle text-primary shadow-xs focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{app.user.fullName}</TableCell>
                      <TableCell>{app.user.email}</TableCell>
                      <TableCell>{app.course?.title ?? "-"}</TableCell>
                      <TableCell>
                        <StatusBadge status={app.status} />
                      </TableCell>
                      <TableCell>
                        {app.submittedAt ? app.submittedAt.toLocaleString() : "-"}
                      </TableCell>
                      <TableCell>{app.updatedAt.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/applications/${app.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {applications.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        No applications yet.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </form>
        </CardContent>
      </Card>

      <SimplePagination
        page={Math.min(page, totalPages)}
        totalPages={totalPages}
        hrefForPage={(p) => `/admin/applications?page=${p}`}
      />
    </div>
  );
}
