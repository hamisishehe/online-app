"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  changePasswordSchema,
  FormState,
  loginSchema,
  profileSchema,
  registerSchema,
} from "@/lib/validation";

function getPrismaErrorCode(error: unknown): string | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) return error.code;
  return null;
}

function toDbErrorState(error: unknown): FormState | null {
  const code = getPrismaErrorCode(error);
  if (code === "P2021") {
    return {
      message:
        "Database table is missing or Prisma Client is out of date. Stop `npm run dev`, run `npx prisma db push` (or `npx prisma migrate dev --name init`), then run `npx prisma generate`, and restart the dev server.",
    };
  }
  if (code === "P1000") {
    return { message: "Database login failed. Check DATABASE_URL username/password." };
  }
  if (code === "P1001") {
    return { message: "Cannot reach database server. Is Postgres running?" };
  }
  return null;
}

export async function register(state: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phoneNumber: formData.get("phoneNumber"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { fullName, email, phoneNumber, password } = parsed.data;

  let existing;
  try {
    existing = await prisma.user.findUnique({ where: { email } });
  } catch (error) {
    return toDbErrorState(error) ?? { message: "Database error." };
  }
  if (existing) return { message: "Email is already registered." };

  let user;
  try {
    user = await prisma.user.create({
      data: {
        fullName,
        email,
        phoneNumber,
        passwordHash: hashPassword(password),
        role: "APPLICANT",
        application: { create: {} },
      },
      select: { id: true, role: true },
    });
  } catch (error) {
    return toDbErrorState(error) ?? { message: "Database error." };
  }

  await createSession({ userId: user.id, role: user.role });
  redirect("/app/dashboard");
}

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true, role: true },
    });
  } catch (error) {
    return toDbErrorState(error) ?? { message: "Database error." };
  }

  if (!user) return { message: "Invalid email or password." };
  if (!verifyPassword(password, user.passwordHash))
    return { message: "Invalid email or password." };

  await createSession({ userId: user.id, role: user.role });
  redirect(user.role === "ADMIN" ? "/admin/dashboard" : "/app/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function updateProfile(state: FormState, formData: FormData): Promise<FormState> {
  const { requireUser } = await import("@/lib/auth/current-user");
  const user = await requireUser();

  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    phoneNumber: formData.get("phoneNumber"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: parsed.data,
    });
  } catch (error) {
    return toDbErrorState(error) ?? { message: "Database error." };
  }

  return { message: "Profile updated." };
}

export async function changePassword(state: FormState, formData: FormData): Promise<FormState> {
  const { requireUser } = await import("@/lib/auth/current-user");
  const user = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  let existing;
  try {
    existing = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });
  } catch (error) {
    return toDbErrorState(error) ?? { message: "Database error." };
  }
  if (!existing) return { message: "User not found." };

  if (!verifyPassword(parsed.data.currentPassword, existing.passwordHash)) {
    return { message: "Current password is incorrect." };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(parsed.data.newPassword) },
    });
  } catch (error) {
    return toDbErrorState(error) ?? { message: "Database error." };
  }

  return { message: "Password changed." };
}
