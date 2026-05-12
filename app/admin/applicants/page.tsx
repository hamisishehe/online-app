import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/current-user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

type ApplicantStatusFilter = "all" | "DRAFT" | "SUBMITTED";

function parsePage(value: unknown) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function parseStatusFilter(value: unknown): ApplicantStatusFilter {
  if (value === "DRAFT" || value === "SUBMITTED") {
    return value;
  }

  return "all";
}

export default async function Page(props: PageProps<"/admin/applicants">) {
  await requireAdmin();

  const searchParams = await props.searchParams;
  const pageSize = 10;
  const requestedPage = parsePage(searchParams.page);
  const statusFilter = parseStatusFilter(searchParams.status);

  const where = {
    role: "APPLICANT" as const,
    ...(statusFilter === "all"
      ? {}
      : { application: { is: { status: statusFilter } } }),
  };

  const total = await prisma.user.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * pageSize;

  const applicants = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take: pageSize,
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      createdAt: true,
      application: {
        select: { id: true, status: true, submittedAt: true, updatedAt: true },
      },
    },
  });

  const start = total === 0 ? 0 : skip + 1;
  const end = Math.min(skip + applicants.length, total);

  const baseParams = new URLSearchParams();
  if (statusFilter !== "all") {
    baseParams.set("status", statusFilter);
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="grid gap-1">
              <CardTitle>Applicants</CardTitle>
              <CardDescription>Registered users who can apply.</CardDescription>
            </div>
            <Badge variant="secondary">{total}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 px-0">
          <div className="px-6">
            <form method="GET" className="flex flex-wrap items-end gap-3">
              <div className="grid gap-1">
                <label className="text-sm font-medium" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={statusFilter}
                  className="h-9 w-56 max-w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="all">All applicants</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SUBMITTED">Submitted</option>
                </select>
              </div>
              <Button type="submit" size="sm">
                Apply
              </Button>
            </form>
          </div>

          <div className="px-6 text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{start}</span>-
            <span className="font-medium text-foreground">{end}</span> of{" "}
            <span className="font-medium text-foreground">{total}</span> applicants
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applicants.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.fullName}</TableCell>
                  <TableCell>{a.email}</TableCell>
                  <TableCell>{a.phoneNumber}</TableCell>
                  <TableCell>
                    {a.application ? (
                      <StatusBadge status={a.application.status} />
                    ) : (
                      <Badge variant="secondary">No application</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {a.application?.updatedAt
                      ? a.application.updatedAt.toLocaleString()
                      : a.createdAt.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {a.application ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/applications/${a.application.id}`}>
                          View
                        </Link>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {applicants.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No applicants found for this status.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SimplePagination
        page={page}
        totalPages={totalPages}
        hrefForPage={(p) => {
          const params = new URLSearchParams(baseParams);
          params.set("page", String(p));
          const qs = params.toString();
          return qs.length ? `/admin/applicants?${qs}` : `/admin/applicants?page=${p}`;
        }}
      />
    </div>
  );
}
