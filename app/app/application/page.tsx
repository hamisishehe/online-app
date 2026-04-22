import { requireApplicant } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { getApplicationProgress } from "@/lib/application";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationForms } from "@/app/app/application/application-forms";
import { Prisma } from "@prisma/client";
import { getPrismaDelegate, hasFunction } from "@/lib/prisma-delegates";

export default async function Page() {
  const user = await requireApplicant();

  type ApplicationRow = {
    id: number;
    courseId: number | null;
    status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
    submittedAt: Date | null;
    adminNote: string | null;
    course: { id: number; title: string; duration: string | null; isActive: boolean } | null;
    preferredCollege: string | null;
    gender: string | null;
    dateOfBirth: Date | null;
    citizenship: string | null;
    nidaNumber: string | null;
    hasNbcAccount: boolean | null;
    applicantPoBox: string | null;
    residenceVillageWard: string | null;
    residenceDistrict: string | null;
    guardianFullName: string | null;
    guardianPoBox: string | null;
    guardianPhoneNumber: string | null;
    guardianEmail: string | null;
    educationLevel: string | null;
    educationYearCompleted: number | null;
    educationGrade: string | null;
    educationInstitution: string | null;
    passportPhotoUrl: string | null;
    birthCertificateUrl: string | null;
    educationCertificatesUrl: string | null;
    declarationAccepted: boolean | null;
    applicantSignatureName: string | null;
    applicantSignatureDate: Date | null;
    guardianSignatureName: string | null;
    guardianSignatureDate: Date | null;
  };

  const applicationDelegate = getPrismaDelegate("application");
  if (!hasFunction(applicationDelegate, "findUnique")) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prisma Client not updated</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Stop <code>npm run dev</code>, then run <code>npm run prisma:push</code>{" "}
          and <code>npm run prisma:generate</code>.
        </CardContent>
      </Card>
    );
  }

  let application: ApplicationRow | null = null;
  try {
    application =
      ((await applicationDelegate.findUnique({
        where: { userId: user.id },
        select: {
          id: true,
          courseId: true,
          status: true,
          submittedAt: true,
          adminNote: true,
          course: { select: { id: true, title: true, duration: true, isActive: true } },
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
        },
      })) as unknown as ApplicationRow | null) ?? null;
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
            Stop <code>npm run dev</code>, then run <code>npm run prisma:push</code>{" "}
            and <code>npm run prisma:generate</code>.
          </CardContent>
        </Card>
      );
    }

    if (error instanceof Error && error.message.includes("Unknown arg")) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Prisma Client not updated</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Stop <code>npm run dev</code>, then run <code>npm run prisma:push</code>{" "}
            and <code>npm run prisma:generate</code>.
          </CardContent>
        </Card>
      );
    }

    throw error;
  }

  if (!application) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No application found.</p>
        </CardContent>
      </Card>
    );
  }

  const progress = getApplicationProgress(application);
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true, title: true, duration: true },
  });

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">My application</h2>
        <StatusBadge status={application.status} />
      </div>

      <ApplicationForms
        user={{
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
        }}
        application={{
          status: application.status,
          submittedAt: application.submittedAt?.toISOString() ?? null,
          adminNote: application.adminNote,
          courseId: application.courseId,
          preferredCollege: application.preferredCollege,
          gender: application.gender,
          dateOfBirth: application.dateOfBirth?.toISOString().slice(0, 10) ?? null,
          citizenship: application.citizenship,
          nidaNumber: application.nidaNumber,
          hasNbcAccount: application.hasNbcAccount ?? false,
          applicantPoBox: application.applicantPoBox,
          residenceVillageWard: application.residenceVillageWard,
          residenceDistrict: application.residenceDistrict,
          guardianFullName: application.guardianFullName,
          guardianPoBox: application.guardianPoBox,
          guardianPhoneNumber: application.guardianPhoneNumber,
          guardianEmail: application.guardianEmail,
          educationLevel: application.educationLevel,
          educationYearCompleted: application.educationYearCompleted,
          educationGrade: application.educationGrade,
          educationInstitution: application.educationInstitution,
          passportPhotoUrl: application.passportPhotoUrl,
          birthCertificateUrl: application.birthCertificateUrl,
          educationCertificatesUrl: application.educationCertificatesUrl,
          declarationAccepted: application.declarationAccepted ?? false,
          applicantSignatureName: application.applicantSignatureName,
          guardianSignatureName: application.guardianSignatureName,
        }}
        progress={progress}
        courses={courses}
        selectedCourse={application.course}
      />
    </div>
  );
}
