"use server";

import { randomUUID } from "crypto";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApplicant } from "@/lib/auth/current-user";
import { getPrismaDelegate, hasFunction } from "@/lib/prisma-delegates";
import {
  contactInfoSchema,
  declarationSchema,
  educationStepSchema,
  FormState,
  personalInfoSchema,
} from "@/lib/validation";

function toDbErrorState(error: unknown): FormState | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
    return {
      message:
        "Database table is missing or Prisma Client is out of date. Stop `npm run dev`, run `npm run prisma:push`, then `npm run prisma:generate`, and restart the dev server.",
    };
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P1000") {
    return { message: "Database login failed. Check DATABASE_URL username/password." };
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P1001") {
    return { message: "Cannot reach database server. Is Postgres running?" };
  }
  if (error instanceof Error && error.message.includes("Unknown arg")) {
    return {
      message:
        "Prisma Client is not updated for the latest schema. Stop `npm run dev`, then run `npm run prisma:push` and `npm run prisma:generate`.",
    };
  }
  return null;
}

function getApplicationDelegate() {
  const delegate = getPrismaDelegate("application");
  if (!hasFunction(delegate, "findUnique") || !hasFunction(delegate, "update")) {
    return null;
  }
  return delegate;
}

async function saveUpload(file: File | null) {
  if (!file || file.size === 0) return null;

  const allowedTypes = new Set([
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
  ]);
  if (!allowedTypes.has(file.type)) return null;

  const extRaw = path.extname(file.name || "").toLowerCase();
  const ext = [".png", ".jpg", ".jpeg", ".webp", ".pdf"].includes(extRaw)
    ? extRaw
    : file.type === "application/pdf"
      ? ".pdf"
      : ".png";

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "applications");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${Date.now()}-${randomUUID()}${ext}`;
  const filepath = path.join(uploadsDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filepath, buffer);
  return `/uploads/applications/${filename}`;
}

async function getDraftApplicationForUser(userId: number) {
  const delegate = getApplicationDelegate();
  if (!delegate) {
    return { ok: false as const, state: { message: "Prisma Client is not updated. Stop `npm run dev`, then run `npm run prisma:push` and `npm run prisma:generate`." } };
  }

  type AppRow = {
    id: number;
    status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
    passportPhotoUrl: string | null;
    birthCertificateUrl: string | null;
    educationCertificatesUrl: string | null;
  };

  let app: AppRow | null = null;
  try {
    app =
      ((await delegate.findUnique({
        where: { userId },
        select: {
          id: true,
          status: true,
          passportPhotoUrl: true,
          birthCertificateUrl: true,
          educationCertificatesUrl: true,
        },
      })) as unknown as AppRow | null) ?? null;
  } catch (error) {
    return { ok: false as const, state: toDbErrorState(error) ?? { message: "Database error." } };
  }

  if (!app) return { ok: false as const, state: { message: "Application not found." } };
  if (app.status !== "DRAFT") return { ok: false as const, state: { message: "Application is read-only." } };

  return { ok: true as const, delegate, app };
}

export async function savePersonalInfo(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireApplicant();

  const parsed = personalInfoSchema.safeParse({
    gender: formData.get("gender"),
    dateOfBirth: formData.get("dateOfBirth"),
    citizenship: formData.get("citizenship"),
    nidaNumber: formData.get("nidaNumber"),
    hasNbcAccount: formData.get("hasNbcAccount"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const draft = await getDraftApplicationForUser(user.id);
  if (!draft.ok) return draft.state;

  try {
    await draft.delegate.update({
      where: { id: draft.app.id },
      data: {
        gender: parsed.data.gender,
        dateOfBirth: new Date(parsed.data.dateOfBirth),
        citizenship: parsed.data.citizenship,
        nidaNumber: parsed.data.nidaNumber,
        hasNbcAccount: parsed.data.hasNbcAccount,
      },
    });
  } catch (error) {
    return toDbErrorState(error) ?? { message: "Database error." };
  }

  redirect("/app/application?step=contacts");
}

export async function saveContactInfo(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireApplicant();

  const parsed = contactInfoSchema.safeParse({
    applicantPoBox: formData.get("applicantPoBox"),
    residenceVillageWard: formData.get("residenceVillageWard"),
    residenceDistrict: formData.get("residenceDistrict"),
    guardianFullName: formData.get("guardianFullName"),
    guardianPoBox: formData.get("guardianPoBox"),
    guardianPhoneNumber: formData.get("guardianPhoneNumber"),
    guardianEmail: formData.get("guardianEmail"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const draft = await getDraftApplicationForUser(user.id);
  if (!draft.ok) return draft.state;

  const guardianEmail = parsed.data.guardianEmail?.trim();

  try {
    await draft.delegate.update({
      where: { id: draft.app.id },
      data: {
        applicantPoBox: parsed.data.applicantPoBox?.trim() || null,
        residenceVillageWard: parsed.data.residenceVillageWard,
        residenceDistrict: parsed.data.residenceDistrict,
        guardianFullName: parsed.data.guardianFullName,
        guardianPoBox: parsed.data.guardianPoBox?.trim() || null,
        guardianPhoneNumber: parsed.data.guardianPhoneNumber,
        guardianEmail: guardianEmail?.length ? guardianEmail : null,
      },
    });
  } catch (error) {
    return toDbErrorState(error) ?? { message: "Database error." };
  }

  redirect("/app/application?step=education");
}

export async function saveEducationInfo(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireApplicant();

  const parsed = educationStepSchema.safeParse({
    courseId: formData.get("courseId"),
    preferredCollege: formData.get("preferredCollege"),
    educationLevel: formData.get("educationLevel"),
    educationYearCompleted: formData.get("educationYearCompleted"),
    educationGrade: formData.get("educationGrade"),
    educationInstitution: formData.get("educationInstitution"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const course = await prisma.course.findUnique({
    where: { id: parsed.data.courseId },
    select: { id: true, isActive: true },
  });
  if (!course || !course.isActive) return { message: "Kozi uliyochagua haipatikani." };

  const draft = await getDraftApplicationForUser(user.id);
  if (!draft.ok) return draft.state;

  try {
    await draft.delegate.update({
      where: { id: draft.app.id },
      data: {
        courseId: parsed.data.courseId,
        preferredCollege: parsed.data.preferredCollege,
        educationLevel: parsed.data.educationLevel,
        educationYearCompleted: parsed.data.educationYearCompleted,
        educationGrade: parsed.data.educationGrade,
        educationInstitution: parsed.data.educationInstitution,
      },
    });
  } catch (error) {
    return toDbErrorState(error) ?? { message: "Database error." };
  }

  redirect("/app/application?step=declaration");
}

export async function saveDeclaration(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireApplicant();

  const parsed = declarationSchema.safeParse({
    declarationAccepted: formData.get("declarationAccepted"),
    applicantSignatureName: formData.get("applicantSignatureName"),
    guardianSignatureName: formData.get("guardianSignatureName"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const draft = await getDraftApplicationForUser(user.id);
  if (!draft.ok) return draft.state;

  const passportFile = formData.get("passportPhotoFile");
  const birthFile = formData.get("birthCertificateFile");
  const eduFile = formData.get("educationCertificatesFile");

  const uploadedPassport =
    passportFile instanceof File ? await saveUpload(passportFile) : null;
  const uploadedBirth =
    birthFile instanceof File ? await saveUpload(birthFile) : null;
  const uploadedEdu = eduFile instanceof File ? await saveUpload(eduFile) : null;

  const passportPhotoUrl = uploadedPassport ?? draft.app.passportPhotoUrl;
  const birthCertificateUrl = uploadedBirth ?? draft.app.birthCertificateUrl;
  const educationCertificatesUrl = uploadedEdu ?? draft.app.educationCertificatesUrl;

  if (!passportPhotoUrl || !birthCertificateUrl || !educationCertificatesUrl) {
    return {
      message:
        "Tafadhali pakia: picha ya passport, cheti cha kuzaliwa, na vyeti vya elimu (PDF au picha).",
    };
  }

  try {
    await draft.delegate.update({
      where: { id: draft.app.id },
      data: {
        passportPhotoUrl,
        birthCertificateUrl,
        educationCertificatesUrl,
        declarationAccepted: parsed.data.declarationAccepted,
        applicantSignatureName: parsed.data.applicantSignatureName,
        applicantSignatureDate: new Date(),
        guardianSignatureName: parsed.data.guardianSignatureName?.trim() || null,
        guardianSignatureDate: parsed.data.guardianSignatureName?.trim()
          ? new Date()
          : null,
      },
    });
  } catch (error) {
    return toDbErrorState(error) ?? { message: "Database error." };
  }

  redirect("/app/application?step=submit");
}

function isCompleteForSubmit(app: {
  courseId: number | null;
  preferredCollege: string | null;
  gender: string | null;
  dateOfBirth: Date | null;
  citizenship: string | null;
  nidaNumber: string | null;
  residenceVillageWard: string | null;
  residenceDistrict: string | null;
  guardianFullName: string | null;
  guardianPhoneNumber: string | null;
  educationLevel: string | null;
  educationYearCompleted: number | null;
  educationGrade: string | null;
  educationInstitution: string | null;
  declarationAccepted: boolean;
  passportPhotoUrl: string | null;
  birthCertificateUrl: string | null;
  educationCertificatesUrl: string | null;
}) {
  return (
    !!app.courseId &&
    !!app.preferredCollege &&
    !!app.gender &&
    !!app.dateOfBirth &&
    !!app.citizenship &&
    !!app.nidaNumber &&
    !!app.residenceVillageWard &&
    !!app.residenceDistrict &&
    !!app.guardianFullName &&
    !!app.guardianPhoneNumber &&
    !!app.educationLevel &&
    !!app.educationYearCompleted &&
    !!app.educationGrade &&
    !!app.educationInstitution &&
    app.declarationAccepted &&
    !!app.passportPhotoUrl &&
    !!app.birthCertificateUrl &&
    !!app.educationCertificatesUrl
  );
}

export async function submitApplication(_state: FormState, _formData: FormData): Promise<FormState> {
  void _state;
  void _formData;

  const user = await requireApplicant();
  const delegate = getApplicationDelegate();
  if (!delegate) {
    return {
      message:
        "Prisma Client is not updated. Stop `npm run dev`, then run `npm run prisma:push` and `npm run prisma:generate`.",
    };
  }

  type SubmitCheckApp = {
    id: number;
    status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
    courseId: number | null;
    preferredCollege: string | null;
    gender: string | null;
    dateOfBirth: Date | null;
    citizenship: string | null;
    nidaNumber: string | null;
    residenceVillageWard: string | null;
    residenceDistrict: string | null;
    guardianFullName: string | null;
    guardianPhoneNumber: string | null;
    educationLevel: string | null;
    educationYearCompleted: number | null;
    educationGrade: string | null;
    educationInstitution: string | null;
    declarationAccepted: boolean;
    passportPhotoUrl: string | null;
    birthCertificateUrl: string | null;
    educationCertificatesUrl: string | null;
  };

  let app: SubmitCheckApp | null = null;
  try {
    app =
      ((await delegate.findUnique({
        where: { userId: user.id },
        select: {
          id: true,
          status: true,
          courseId: true,
          preferredCollege: true,
          gender: true,
          dateOfBirth: true,
          citizenship: true,
          nidaNumber: true,
          residenceVillageWard: true,
          residenceDistrict: true,
          guardianFullName: true,
          guardianPhoneNumber: true,
          educationLevel: true,
          educationYearCompleted: true,
          educationGrade: true,
          educationInstitution: true,
          declarationAccepted: true,
          passportPhotoUrl: true,
          birthCertificateUrl: true,
          educationCertificatesUrl: true,
        },
      })) as unknown as SubmitCheckApp | null) ?? null;
  } catch (error) {
    return toDbErrorState(error) ?? { message: "Database error." };
  }

  if (!app) return { message: "Application not found." };
  if (app.status !== "DRAFT") return { message: "Application has already been submitted." };

  if (!isCompleteForSubmit(app)) {
    return { message: "Tafadhali kamilisha hatua zote kabla ya kuwasilisha." };
  }

  try {
    await delegate.update({
      where: { id: app.id },
      data: { status: "SUBMITTED", submittedAt: new Date() },
    });
  } catch (error) {
    return toDbErrorState(error) ?? { message: "Database error." };
  }

  redirect("/app/application?step=submit");
}
