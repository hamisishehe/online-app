import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/current-user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { SimplePagination } from "@/components/simple-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Row = {
  id: number;
  status: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "DRAFT";
  submittedAt: Date | null;
  course: { id: number; title: string } | null;
  user: { fullName: string; email: string; phoneNumber: string };
};

function parsePage(value: unknown) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function parseCourseId(value: unknown) {
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? Math.floor(id) : null;
}

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string; courseId?: string };
}) {
  await requireAdmin();

  const pageSize = 20;
  const page = parsePage(searchParams.page);
  const courseId = parseCourseId(searchParams.courseId);
  const skip = (page - 1) * pageSize;

  const courses = await prisma.course.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true, title: true, duration: true, isActive: true },
  });

  const where = {
    status: { not: "DRAFT" as const },
    ...(courseId ? { courseId } : { courseId: { not: null } }),
  };

  const [total, applications] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        status: true,
        submittedAt: true,
        course: { select: { id: true, title: true } },
        user: { select: { fullName: true, email: true, phoneNumber: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const baseParams = new URLSearchParams();
  if (courseId) baseParams.set("courseId", String(courseId));

  const downloadHref = `/admin/reports/download${courseId ? `?courseId=${courseId}` : ""}`;

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="grid gap-1">
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Applicants who submitted applications (filter by course).
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{total} applications</Badge>
              <Button asChild size="sm" variant="outline">
                <Link href={downloadHref}>Download Excel (CSV)</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          <form method="GET" className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1">
              <label className="text-sm font-medium" htmlFor="courseId">
                Course
              </label>
              <select
                id="courseId"
                name="courseId"
                defaultValue={courseId ? String(courseId) : ""}
                className="h-9 w-72 max-w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                    {!c.isActive ? " (Hidden)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" size="sm">
              Apply filter
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Applications</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.user.fullName}</TableCell>
                  <TableCell>{a.user.email}</TableCell>
                  <TableCell>{a.user.phoneNumber}</TableCell>
                  <TableCell>{a.course?.title ?? "-"}</TableCell>
                  <TableCell>
                    <StatusBadge status={a.status as Row["status"]} />
                  </TableCell>
                  <TableCell>
                    {a.submittedAt ? a.submittedAt.toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/applications/${a.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No applications found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SimplePagination
        page={Math.min(page, totalPages)}
        totalPages={totalPages}
        hrefForPage={(p) => {
          const params = new URLSearchParams(baseParams);
          params.set("page", String(p));
          const qs = params.toString();
          return qs.length ? `/admin/reports?${qs}` : `/admin/reports?page=${p}`;
        }}
      />
    </div>
  );
}
