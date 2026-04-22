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

function parsePage(value: unknown) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  await requireAdmin();

  const pageSize = 10;
  const page = parsePage(searchParams.page);
  const skip = (page - 1) * pageSize;

  const [total, applicants] = await Promise.all([
    prisma.user.count({ where: { role: "APPLICANT" } }),
    prisma.user.findMany({
      where: { role: "APPLICANT" },
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
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="grid gap-1">
              <CardTitle>Applicants</CardTitle>
              <CardDescription>Registered users who can apply.</CardDescription>
            </div>
            <Badge variant="secondary">{applicants.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="px-0">
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
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {applicants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No applicants yet.
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
        hrefForPage={(p) => `/admin/applicants?page=${p}`}
      />
    </div>
  );
}
