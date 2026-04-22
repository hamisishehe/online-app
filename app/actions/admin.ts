"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/current-user";
import { DEFAULT_RESET_PASSWORD } from "@/lib/auth/default-password";
import { hashPassword } from "@/lib/auth/password";
import { FormState } from "@/lib/validation";
import { redirect } from "next/navigation";
import { z } from "zod";

const updateStatusSchema = z.object({
  applicationId: z.coerce.number().int().positive(),
  status: z.enum(["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"]),
  adminNote: z.string().trim().optional(),
});

const bulkUpdateStatusSchema = z.object({
  applicationIds: z.array(z.coerce.number().int().positive()).min(1, "Select at least one application."),
  status: z.enum(["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"]),
  adminNote: z.string().trim().optional(),
  redirectTo: z.string().trim().optional(),
});

const updateUserRoleSchema = z.object({
  userId: z.coerce.number().int().positive(),
  role: z.enum(["APPLICANT", "ADMIN"]),
});

const resetUserPasswordSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

export async function updateApplicationStatus(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = updateStatusSchema.safeParse({
    applicationId: formData.get("applicationId"),
    status: formData.get("status"),
    adminNote: formData.get("adminNote"),
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await prisma.application.update({
    where: { id: parsed.data.applicationId },
    data: {
      status: parsed.data.status,
      adminNote: parsed.data.adminNote || null,
      reviewedAt: new Date(),
    },
  });

  return { message: "Application updated." };
}

function safeRedirectToAdminApplications(value: string | undefined) {
  if (!value) return "/admin/applications";
  if (!value.startsWith("/admin/applications")) return "/admin/applications";
  return value;
}

function appendQueryParam(href: string, key: string, value: string) {
  const [path, query = ""] = href.split("?", 2);
  const params = new URLSearchParams(query);
  params.set(key, value);
  const qs = params.toString();
  return qs.length ? `${path}?${qs}` : path;
}

export async function bulkUpdateApplicationStatus(
  formData: FormData
): Promise<void> {
  await requireAdmin();

  const redirectTo = safeRedirectToAdminApplications(
    (formData.get("redirectTo") as string | null) ?? undefined
  );

  const parsed = bulkUpdateStatusSchema.safeParse({
    applicationIds: formData.getAll("applicationIds"),
    status: formData.get("status"),
    adminNote: formData.get("adminNote"),
    redirectTo: redirectTo,
  });

  if (!parsed.success) {
    redirect(appendQueryParam(redirectTo, "error", "1"));
  }

  const result = await prisma.application.updateMany({
    where: { id: { in: parsed.data.applicationIds } },
    data: {
      status: parsed.data.status,
      adminNote: parsed.data.adminNote?.length ? parsed.data.adminNote : null,
      reviewedAt: new Date(),
    },
  });

  redirect(appendQueryParam(redirectTo, "updated", String(result.count)));
}

export async function updateUserRole(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdmin();
  void state;

  const parsed = updateUserRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  if (parsed.data.userId === admin.id) {
    return { message: "You cannot change your own role." };
  }

  const existing = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, role: true },
  });

  if (!existing) return { message: "User not found." };

  if (existing.role === "ADMIN" && parsed.data.role === "APPLICANT") {
    const adminsCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminsCount <= 1) {
      return { message: "Cannot remove the last admin." };
    }
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { role: parsed.data.role },
  });

  return { message: "Role updated." };
}

export async function resetUserPassword(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  void state;

  const parsed = resetUserPasswordSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const existing = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, role: true },
  });

  if (!existing) return { message: "User not found." };

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { passwordHash: hashPassword(DEFAULT_RESET_PASSWORD) },
  });

  return {
    message: `Password reset. Default password is ${DEFAULT_RESET_PASSWORD}.`,
  };
}
