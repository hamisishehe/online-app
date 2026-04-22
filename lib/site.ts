import { Prisma } from "@prisma/client";
import { getPrismaDelegate, hasFunction } from "@/lib/prisma-delegates";
import { isMissingDatabaseUrlError } from "@/lib/prisma";

type SiteSettingsRow = {
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
};

type CourseRow = {
  id: number;
  title: string;
  duration: string | null;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
};

export async function getPublicSiteContent(): Promise<{
  settings: SiteSettingsRow | null;
  courses: CourseRow[];
}> {
  try {
    const siteSettingsDelegate = getPrismaDelegate("siteSettings");
    const courseDelegate = getPrismaDelegate("course");

    if (
      !hasFunction(siteSettingsDelegate, "findFirst") ||
      !hasFunction(courseDelegate, "findMany")
    ) {
      return { settings: null, courses: [] };
    }

    const settings =
      ((await siteSettingsDelegate.findFirst({
        orderBy: { id: "asc" },
      })) as unknown as SiteSettingsRow | null) ?? null;

    const courses = (await courseDelegate.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    })) as unknown as CourseRow[];

    return { settings, courses };
  } catch (error) {
    if (isMissingDatabaseUrlError(error)) {
      return { settings: null, courses: [] };
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      ["P1000", "P1001", "P2021"].includes(error.code)
    ) {
      return { settings: null, courses: [] };
    }
    throw error;
  }
}
