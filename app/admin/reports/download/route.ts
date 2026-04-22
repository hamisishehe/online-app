import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";

function parseCourseId(value: string | null) {
  if (!value) return null;
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? Math.floor(id) : null;
}

function csvEscape(value: unknown) {
  const text =
    value === null || value === undefined ? "" : String(value).replace(/\r?\n/g, " ").trim();
  if (text.includes('"') || text.includes(",") || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  const courseId = parseCourseId(req.nextUrl.searchParams.get("courseId"));

  const where = {
    status: { not: "DRAFT" as const },
    ...(courseId ? { courseId } : { courseId: { not: null } }),
  };

  const applications = await prisma.application.findMany({
    where,
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      status: true,
      submittedAt: true,
      reviewedAt: true,
      adminNote: true,
      preferredCollege: true,
      gender: true,
      dateOfBirth: true,
      citizenship: true,
      nidaNumber: true,
      hasNbcAccount: true,
      applicantPoBox: true,
      residenceVillageWard: true,
      residenceDistrict: true,
      guardianFullName: true,
      guardianPoBox: true,
      guardianPhoneNumber: true,
      guardianEmail: true,
      educationLevel: true,
      educationYearCompleted: true,
      educationGrade: true,
      educationInstitution: true,
      passportPhotoUrl: true,
      birthCertificateUrl: true,
      educationCertificatesUrl: true,
      declarationAccepted: true,
      applicantSignatureName: true,
      applicantSignatureDate: true,
      guardianSignatureName: true,
      guardianSignatureDate: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          role: true,
          createdAt: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          duration: true,
          description: true,
          isActive: true,
        },
      },
    },
  });

  const columns = [
    // User
    "userId",
    "fullName",
    "email",
    "phoneNumber",
    "role",
    "userCreatedAt",
    // Course
    "courseId",
    "courseTitle",
    "courseDuration",
    "courseIsActive",
    // Application meta
    "applicationId",
    "status",
    "submittedAt",
    "reviewedAt",
    "adminNote",
    // Step 1
    "gender",
    "dateOfBirth",
    "citizenship",
    "nidaNumber",
    "hasNbcAccount",
    // Step 2
    "applicantPoBox",
    "residenceVillageWard",
    "residenceDistrict",
    "guardianFullName",
    "guardianPoBox",
    "guardianPhoneNumber",
    "guardianEmail",
    // Step 3
    "preferredCollege",
    "educationLevel",
    "educationYearCompleted",
    "educationGrade",
    "educationInstitution",
    // Step 4 uploads
    "passportPhotoUrl",
    "birthCertificateUrl",
    "educationCertificatesUrl",
    // Declaration
    "declarationAccepted",
    "applicantSignatureName",
    "applicantSignatureDate",
    "guardianSignatureName",
    "guardianSignatureDate",
    // System
    "createdAt",
    "updatedAt",
  ];

  const lines: string[] = [];
  lines.push(columns.join(","));

  for (const a of applications) {
    const row: Record<string, unknown> = {
      userId: a.user.id,
      fullName: a.user.fullName,
      email: a.user.email,
      phoneNumber: a.user.phoneNumber,
      role: a.user.role,
      userCreatedAt: a.user.createdAt?.toISOString?.() ?? "",

      courseId: a.course?.id ?? "",
      courseTitle: a.course?.title ?? "",
      courseDuration: a.course?.duration ?? "",
      courseIsActive: a.course?.isActive ?? "",

      applicationId: a.id,
      status: a.status,
      submittedAt: a.submittedAt ? a.submittedAt.toISOString() : "",
      reviewedAt: a.reviewedAt ? a.reviewedAt.toISOString() : "",
      adminNote: a.adminNote ?? "",

      gender: a.gender ?? "",
      dateOfBirth: a.dateOfBirth ? a.dateOfBirth.toISOString().slice(0, 10) : "",
      citizenship: a.citizenship ?? "",
      nidaNumber: a.nidaNumber ?? "",
      hasNbcAccount: a.hasNbcAccount ?? "",

      applicantPoBox: a.applicantPoBox ?? "",
      residenceVillageWard: a.residenceVillageWard ?? "",
      residenceDistrict: a.residenceDistrict ?? "",
      guardianFullName: a.guardianFullName ?? "",
      guardianPoBox: a.guardianPoBox ?? "",
      guardianPhoneNumber: a.guardianPhoneNumber ?? "",
      guardianEmail: a.guardianEmail ?? "",

      preferredCollege: a.preferredCollege ?? "",
      educationLevel: a.educationLevel ?? "",
      educationYearCompleted: a.educationYearCompleted ?? "",
      educationGrade: a.educationGrade ?? "",
      educationInstitution: a.educationInstitution ?? "",

      passportPhotoUrl: a.passportPhotoUrl ?? "",
      birthCertificateUrl: a.birthCertificateUrl ?? "",
      educationCertificatesUrl: a.educationCertificatesUrl ?? "",

      declarationAccepted: a.declarationAccepted ?? "",
      applicantSignatureName: a.applicantSignatureName ?? "",
      applicantSignatureDate: a.applicantSignatureDate ? a.applicantSignatureDate.toISOString() : "",
      guardianSignatureName: a.guardianSignatureName ?? "",
      guardianSignatureDate: a.guardianSignatureDate ? a.guardianSignatureDate.toISOString() : "",

      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    };

    lines.push(columns.map((c) => csvEscape(row[c])).join(","));
  }

  const today = new Date().toISOString().slice(0, 10);
  const filename = courseId
    ? `applications-report-course-${courseId}-${today}.csv`
    : `applications-report-${today}.csv`;

  const csv = `\ufeff${lines.join("\n")}`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"${filename}\"`,
      "Cache-Control": "no-store",
    },
  });
}
