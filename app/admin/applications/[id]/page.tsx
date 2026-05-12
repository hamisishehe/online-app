import Image from "next/image";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/current-user";
import { getPrismaDelegate, hasFunction } from "@/lib/prisma-delegates";
import { Prisma } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { UpdateStatusForm } from "@/app/admin/applications/[id]/status-form";

type UploadPreviewKind = "image" | "pdf" | "file";

type ApplicationDetail = {
  id: number;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  submittedAt: Date | null;
  reviewedAt: Date | null;
  adminNote: string | null;
  course: { title: string } | null;
  user: { fullName: string; email: string; phoneNumber: string };
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
  primarySchoolName: string | null;
  primaryYearFrom: number | null;
  primaryYearTo: number | null;
  primaryQualification: string | null;
  secondarySchoolName: string | null;
  secondaryYearFrom: number | null;
  secondaryYearTo: number | null;
  secondaryGrade: string | null;
  tertiaryInstitutionName: string | null;
  tertiaryCourseName: string | null;
  tertiaryYearFrom: number | null;
  tertiaryYearTo: number | null;
  tertiaryGrade: string | null;
};

function getUploadPreviewKind(url: string): UploadPreviewKind {
  const pathname = url.split("?")[0]?.toLowerCase() ?? "";

  if (pathname.endsWith(".pdf")) {
    return "pdf";
  }

  if (
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".gif") ||
    pathname.endsWith(".svg")
  ) {
    return "image";
  }

  return "file";
}

function getUploadFilename(url: string) {
  const pathname = url.split("?")[0] ?? url;
  const filename = pathname.split("/").filter(Boolean).pop();

  if (!filename) {
    return "Uploaded file";
  }

  try {
    return decodeURIComponent(filename);
  } catch {
    return filename;
  }
}

function UploadPreviewCard({
  label,
  url,
}: {
  label: string;
  url: string | null;
}) {
  if (!url) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 p-4">
        <div className="text-sm font-medium">{label}</div>
        <p className="mt-2 text-sm text-muted-foreground">No file uploaded.</p>
      </div>
    );
  }

  const previewKind = getUploadPreviewKind(url);
  const filename = getUploadFilename(url);

  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div className="grid gap-1">
          <div className="text-sm font-medium">{label}</div>
          <div className="max-w-full break-all text-xs text-muted-foreground">
            {filename}
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <a
            href={url}
            className="font-medium underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            Open
          </a>
          <a
            href={url}
            className="text-muted-foreground underline underline-offset-4"
            download
          >
            Download
          </a>
        </div>
      </div>

      {previewKind === "image" ? (
        <div className="bg-muted/20 p-4">
          <div className="relative h-80 overflow-hidden rounded-lg border bg-background">
            <Image
              src={url}
              alt={label}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain"
            />
          </div>
        </div>
      ) : null}

      {previewKind === "pdf" ? (
        <iframe
          title={label}
          src={url}
          className="h-96 w-full bg-white"
        />
      ) : null}

      {previewKind === "file" ? (
        <div className="p-4 text-sm text-muted-foreground">
          Preview is not available for this file type. Use Open or Download.
        </div>
      ) : null}
    </div>
  );
}

function PrismaNotReadyCard({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Stop <code>npm run dev</code>, then run <code>npm run prisma:push</code>{" "}
        and <code>npm run prisma:generate</code>.
      </CardContent>
    </Card>
  );
}

export default async function Page(
  props: PageProps<"/admin/applications/[id]">
) {
  await requireAdmin();

  const { id: idParam } = await props.params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const applicationDelegate = getPrismaDelegate("application");
  if (!hasFunction(applicationDelegate, "findUnique")) {
    return <PrismaNotReadyCard title="Prisma Client not updated" />;
  }

  let application: ApplicationDetail | null = null;
  try {
    application =
      ((await applicationDelegate.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          submittedAt: true,
          reviewedAt: true,
          adminNote: true,
          course: { select: { title: true } },
          user: { select: { fullName: true, email: true, phoneNumber: true } },
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
          primarySchoolName: true,
          primaryYearFrom: true,
          primaryYearTo: true,
          primaryQualification: true,
          secondarySchoolName: true,
          secondaryYearFrom: true,
          secondaryYearTo: true,
          secondaryGrade: true,
          tertiaryInstitutionName: true,
          tertiaryCourseName: true,
          tertiaryYearFrom: true,
          tertiaryYearTo: true,
          tertiaryGrade: true,
        },
      })) as unknown as ApplicationDetail | null) ?? null;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      return <PrismaNotReadyCard title="Database not ready" />;
    }
    if (error instanceof Error && error.message.includes("Unknown arg")) {
      return <PrismaNotReadyCard title="Prisma Client not updated" />;
    }
    throw error;
  }

  if (!application) notFound();

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1">
              <CardTitle>{application.user.fullName}</CardTitle>
              <CardDescription>
                {application.user.email} • {application.user.phoneNumber}
              </CardDescription>
            </div>
            <StatusBadge status={application.status} />
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Application</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div>
              Course:{" "}
              <span className="font-medium">{application.course?.title ?? "-"}</span>
            </div>
            <div>
              College:{" "}
              <span className="font-medium">{application.preferredCollege ?? "-"}</span>
            </div>
            <div>
              Submitted:{" "}
              <span className="font-medium">
                {application.submittedAt
                  ? application.submittedAt.toLocaleString()
                  : "-"}
              </span>
            </div>
            <div>
              Reviewed:{" "}
              <span className="font-medium">
                {application.reviewedAt
                  ? application.reviewedAt.toLocaleString()
                  : "-"}
              </span>
            </div>
            {application.adminNote ? (
              <div>
                Admin note:{" "}
                <span className="font-medium">{application.adminNote}</span>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <UpdateStatusForm
          applicationId={application.id}
          status={application.status}
          adminNote={application.adminNote ?? ""}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Gender</span>
              <span className="font-medium">{application.gender ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Date of birth</span>
              <span className="font-medium">
                {application.dateOfBirth
                  ? application.dateOfBirth.toLocaleDateString()
                  : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Citizenship</span>
              <span className="font-medium">{application.citizenship ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">NIDA / License</span>
              <span className="font-medium">{application.nidaNumber ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">NBC account</span>
              <span className="font-medium">
                {application.hasNbcAccount ? "Yes" : "No"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">P.O. Box</span>
              <span className="font-medium">{application.applicantPoBox ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Village/Ward</span>
              <span className="font-medium">
                {application.residenceVillageWard ?? "-"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">District</span>
              <span className="font-medium">{application.residenceDistrict ?? "-"}</span>
            </div>
            <div className="mt-2 rounded-xl border bg-muted/20 p-3">
              <div className="mb-2 text-sm font-medium">Guardian</div>
              <div className="grid gap-1 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">
                    {application.guardianFullName ?? "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">
                    {application.guardianPhoneNumber ?? "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">
                    {application.guardianEmail ?? "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">P.O. Box</span>
                  <span className="font-medium">
                    {application.guardianPoBox ?? "-"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Applied course</span>
              <span className="font-medium">{application.course?.title ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Preferred college</span>
              <span className="font-medium">{application.preferredCollege ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Level</span>
              <span className="font-medium">{application.educationLevel ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Year completed</span>
              <span className="font-medium">
                {application.educationYearCompleted ?? "-"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Grade</span>
              <span className="font-medium">{application.educationGrade ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Institution</span>
              <span className="font-medium">
                {application.educationInstitution ?? "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uploads</CardTitle>
            <CardDescription>
              Review every document the applicant submitted.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <UploadPreviewCard
              label="Passport photo"
              url={application.passportPhotoUrl}
            />
            <UploadPreviewCard
              label="Birth certificate"
              url={application.birthCertificateUrl}
            />
            <UploadPreviewCard
              label="Education certificates"
              url={application.educationCertificatesUrl}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Declaration</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Accepted</span>
            <span className="font-medium">
              {application.declarationAccepted ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Applicant signature</span>
            <span className="font-medium">
              {application.applicantSignatureName ?? "-"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Applicant signed</span>
            <span className="font-medium">
              {application.applicantSignatureDate
                ? application.applicantSignatureDate.toLocaleString()
                : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Guardian signature</span>
            <span className="font-medium">
              {application.guardianSignatureName ?? "-"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Guardian signed</span>
            <span className="font-medium">
              {application.guardianSignatureDate
                ? application.guardianSignatureDate.toLocaleString()
                : "-"}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Primary (legacy)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="font-medium">{application.primarySchoolName ?? "-"}</div>
            <div className="text-muted-foreground">
              {application.primaryYearFrom ?? "-"} - {application.primaryYearTo ?? "-"}
            </div>
            <div className="text-muted-foreground">
              {application.primaryQualification ?? "-"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Secondary (legacy)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="font-medium">{application.secondarySchoolName ?? "-"}</div>
            <div className="text-muted-foreground">
              {application.secondaryYearFrom ?? "-"} - {application.secondaryYearTo ?? "-"}
            </div>
            <div className="text-muted-foreground">
              Grade: {application.secondaryGrade ?? "-"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tertiary (legacy)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="font-medium">
              {application.tertiaryInstitutionName ?? "-"}
            </div>
            <div className="text-muted-foreground">
              {application.tertiaryCourseName ?? "-"}
            </div>
            <div className="text-muted-foreground">
              {application.tertiaryYearFrom ?? "-"} - {application.tertiaryYearTo ?? "-"}
            </div>
            <div className="text-muted-foreground">
              Grade: {application.tertiaryGrade ?? "-"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
