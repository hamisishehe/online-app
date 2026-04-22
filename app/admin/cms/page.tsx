import { requireAdmin } from "@/lib/auth/current-user";
import { Prisma } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPrismaDelegate, hasFunction } from "@/lib/prisma-delegates";
import { AdminSettingsClient } from "@/app/admin/settings/settings-client";

export default async function Page() {
  await requireAdmin();

  const siteSettingsDelegate = getPrismaDelegate("siteSettings");
  const courseDelegate = getPrismaDelegate("course");

  if (
    !hasFunction(siteSettingsDelegate, "findFirst") ||
    !hasFunction(courseDelegate, "findMany")
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prisma Client not updated</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="mb-2">
            Your Prisma Client does not include the CMS models yet. Stop{" "}
            <code>npm run dev</code>, then run:
          </p>
          <pre className="rounded-md border bg-muted/30 p-3 text-xs text-foreground">
            npm run prisma:push{"\n"}npm run prisma:generate
          </pre>
        </CardContent>
      </Card>
    );
  }

  type Settings = {
    id: number;
    portalName: string;
    heroTitle: string;
    heroDescription: string;
    ctaText: string;
    logoUrl: string | null;
    heroImageUrl: string | null;
    primaryTheme?: string | null;
    sidebarTheme?: string | null;
    headerTheme?: string | null;
  } | null;

  let settings: Settings = null;
  let courses: {
    id: number;
    title: string;
    duration: string | null;
    description: string | null;
    imageUrl: string | null;
    isActive: boolean;
    sortOrder: number;
  }[] = [];

  try {
    settings =
      ((await siteSettingsDelegate.findFirst({
        orderBy: { id: "asc" },
      })) as unknown as Settings) ?? null;

    courses = (await courseDelegate.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    })) as unknown as typeof courses;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Database not ready</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="mb-2">
              The CMS tables are missing. Run Prisma to create them, then refresh
              this page.
            </p>
            <pre className="rounded-md border bg-muted/30 p-3 text-xs text-foreground">
              npx prisma db push{"\n"}npx prisma generate
            </pre>
          </CardContent>
        </Card>
      );
    }
    throw error;
  }

  return (
    <div className="grid gap-4">
      <h2 className="text-lg font-semibold">Homepage CMS</h2>
      <AdminSettingsClient settings={settings} courses={courses} />
    </div>
  );
}
