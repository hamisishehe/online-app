"use server";

import { randomUUID } from "crypto";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPrismaDelegate, hasFunction } from "@/lib/prisma-delegates";
import {
  createCourseSchema,
  FormState,
  siteSettingsSchema,
  updateCourseSchema,
} from "@/lib/validation";

async function saveImageUpload(file: File | null) {
  if (!file || file.size === 0) return null;
  if (!file.type.startsWith("image/")) return null;

  const extRaw = path.extname(file.name || "").toLowerCase();
  const ext = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(extRaw)
    ? extRaw
    : ".png";

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${Date.now()}-${randomUUID()}${ext}`;
  const filepath = path.join(uploadsDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filepath, buffer);
  return `/uploads/${filename}`;
}

export async function updateSiteSettings(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const siteSettingsDelegate = getPrismaDelegate("siteSettings");
  if (
    !hasFunction(siteSettingsDelegate, "findFirst") ||
    !hasFunction(siteSettingsDelegate, "update") ||
    !hasFunction(siteSettingsDelegate, "create")
  ) {
    return {
      message:
        "Prisma Client is not updated. Stop `npm run dev`, then run `npm run prisma:push` and `npm run prisma:generate`.",
    };
  }

  const parsed = siteSettingsSchema.safeParse({
    portalName: formData.get("portalName"),
    heroTitle: formData.get("heroTitle"),
    heroDescription: formData.get("heroDescription"),
    ctaText: formData.get("ctaText"),
    logoUrl: formData.get("logoUrl") || undefined,
    heroImageUrl: formData.get("heroImageUrl") || undefined,
    primaryTheme: formData.get("primaryTheme") || undefined,
    sidebarTheme: formData.get("sidebarTheme") || undefined,
    headerTheme: formData.get("headerTheme") || undefined,
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const logoFile = formData.get("logoFile");
  const heroFile = formData.get("heroFile");

  const currentLogoUrl = (formData.get("currentLogoUrl") as string | null) ?? "";
  const currentHeroUrl = (formData.get("currentHeroUrl") as string | null) ?? "";
  const removeLogo = formData.get("removeLogo") === "on";
  const removeHero = formData.get("removeHero") === "on";

  const uploadedLogoUrl = logoFile instanceof File ? await saveImageUpload(logoFile) : null;
  const uploadedHeroUrl = heroFile instanceof File ? await saveImageUpload(heroFile) : null;

  const logoUrl = removeLogo
    ? null
    : uploadedLogoUrl ?? (parsed.data.logoUrl?.length ? parsed.data.logoUrl : currentLogoUrl || null);
  const heroImageUrl = removeHero
    ? null
    : uploadedHeroUrl ??
      (parsed.data.heroImageUrl?.length ? parsed.data.heroImageUrl : currentHeroUrl || null);

  const existing =
    ((await siteSettingsDelegate.findFirst({
      orderBy: { id: "asc" },
      select: { id: true },
    })) as unknown as { id: number } | null) ?? null;

  if (existing) {
    try {
      await siteSettingsDelegate.update({
        where: { id: existing.id },
        data: {
          portalName: parsed.data.portalName,
          heroTitle: parsed.data.heroTitle,
          heroDescription: parsed.data.heroDescription,
          ctaText: parsed.data.ctaText,
          logoUrl,
          heroImageUrl,
          primaryTheme: parsed.data.primaryTheme,
          sidebarTheme: parsed.data.sidebarTheme,
          headerTheme: parsed.data.headerTheme,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unknown arg")) {
        return {
          message:
            "Prisma Client is not updated for the latest theme fields. Stop `npm run dev`, then run `npm run prisma:push` and `npm run prisma:generate`, and restart the dev server.",
        };
      }
      throw error;
    }
  } else {
    try {
      await siteSettingsDelegate.create({
        data: {
          portalName: parsed.data.portalName,
          heroTitle: parsed.data.heroTitle,
          heroDescription: parsed.data.heroDescription,
          ctaText: parsed.data.ctaText,
          logoUrl,
          heroImageUrl,
          primaryTheme: parsed.data.primaryTheme,
          sidebarTheme: parsed.data.sidebarTheme,
          headerTheme: parsed.data.headerTheme,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unknown arg")) {
        return {
          message:
            "Prisma Client is not updated for the latest theme fields. Stop `npm run dev`, then run `npm run prisma:push` and `npm run prisma:generate`, and restart the dev server.",
        };
      }
      throw error;
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/cms");
  revalidatePath("/admin/settings");
  return { message: "Homepage content updated." };
}

export async function createCourse(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const courseDelegate = getPrismaDelegate("course");
  if (!hasFunction(courseDelegate, "create")) {
    return {
      message:
        "Prisma Client is not updated. Stop `npm run dev`, then run `npm run prisma:push` and `npm run prisma:generate`.",
    };
  }

  const parsed = createCourseSchema.safeParse({
    title: formData.get("title"),
    duration: formData.get("duration") || undefined,
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    sortOrder: formData.get("sortOrder") ?? 0,
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const imageFile = formData.get("imageFile");
  const uploadedImageUrl =
    imageFile instanceof File ? await saveImageUpload(imageFile) : null;

  await courseDelegate.create({
    data: {
      title: parsed.data.title,
      duration: parsed.data.duration || null,
      description: parsed.data.description || null,
      sortOrder: parsed.data.sortOrder ?? 0,
      imageUrl: uploadedImageUrl ?? (parsed.data.imageUrl || null),
      isActive: true,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/cms");
  revalidatePath("/admin/settings");
  return { message: "Course added." };
}

export async function updateCourse(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const courseDelegate = getPrismaDelegate("course");
  if (!hasFunction(courseDelegate, "update")) {
    return {
      message:
        "Prisma Client is not updated. Stop `npm run dev`, then run `npm run prisma:push` and `npm run prisma:generate`.",
    };
  }

  const parsed = updateCourseSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    duration: formData.get("duration") || undefined,
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    sortOrder: formData.get("sortOrder") ?? 0,
    isActive: formData.get("isActive") || undefined,
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const imageFile = formData.get("imageFile");
  const currentImageUrl =
    (formData.get("currentImageUrl") as string | null) ?? "";
  const removeImage = formData.get("removeImage") === "on";
  const uploadedImageUrl =
    imageFile instanceof File ? await saveImageUpload(imageFile) : null;

  const imageUrl = removeImage
    ? null
    : uploadedImageUrl ??
      (parsed.data.imageUrl?.length ? parsed.data.imageUrl : currentImageUrl || null);

  await courseDelegate.update({
    where: { id: parsed.data.courseId },
    data: {
      title: parsed.data.title,
      duration: parsed.data.duration || null,
      description: parsed.data.description || null,
      sortOrder: parsed.data.sortOrder ?? 0,
      imageUrl,
      ...(typeof parsed.data.isActive === "boolean"
        ? { isActive: parsed.data.isActive }
        : {}),
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/cms");
  revalidatePath("/admin/settings");
  return { message: "Course updated." };
}

export async function deleteCourse(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const courseDelegate = getPrismaDelegate("course");
  if (!hasFunction(courseDelegate, "delete")) {
    return {
      message:
        "Prisma Client is not updated. Stop `npm run dev`, then run `npm run prisma:push` and `npm run prisma:generate`.",
    };
  }

  const courseIdRaw = formData.get("courseId");
  const courseId = Number(courseIdRaw);
  if (!Number.isFinite(courseId) || courseId <= 0) return { message: "Invalid course." };

  // Allow deleting a course even if applications already selected it.
  // We first detach references, then delete the course.
  try {
    await prisma.application.updateMany({
      where: { courseId },
      data: { courseId: null },
    });
  } catch {
    // Ignore and still attempt delete. (DB might not have the relation yet.)
  }

  try {
    await courseDelegate.delete({ where: { id: courseId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return {
        message:
          "Cannot delete this course because there are applications still linked to it.",
      };
    }
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin/cms");
  revalidatePath("/admin/settings");
  return { message: "Course deleted." };
}
