import { cache } from "react";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { isMissingDatabaseUrlError, prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/auth/session";

export const getCurrentUser = cache(async () => {
  const session = await getSessionPayload();
  if (!session) return null;

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
      },
    });
  } catch (error) {
    if (isMissingDatabaseUrlError(error)) return null;

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021")
      return null;
    throw error;
  }

  return user ?? null;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireApplicant() {
  const user = await requireUser();
  if (user.role !== "APPLICANT") redirect("/admin/dashboard");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/app/dashboard");
  return user;
}
