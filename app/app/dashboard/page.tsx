import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireApplicant } from "@/lib/auth/current-user";
import { getApplicationProgress } from "@/lib/application";
import { ApplicationStepper } from "@/components/application-stepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  FileTextIcon,
  GraduationCapIcon,
} from "lucide-react";

function nextIncompleteStep(progress: {
  personalComplete: boolean;
  contactComplete: boolean;
  educationComplete: boolean;
  declarationComplete: boolean;
}) {
  if (!progress.personalComplete) return "personal";
  if (!progress.contactComplete) return "contacts";
  if (!progress.educationComplete) return "education";
  if (!progress.declarationComplete) return "declaration";
  return "submit";
}

function toStepNumber(step: string) {
  const order = ["personal", "contacts", "education", "declaration", "submit"];
  const idx = order.indexOf(step);
  return idx === -1 ? 1 : idx + 1;
}

export default async function Page() {
  const user = await requireApplicant();

  const application = await prisma.application.findUnique({
    where: { userId: user.id },
    select: {
      status: true,
      updatedAt: true,
      courseId: true,
      course: { select: { title: true, duration: true } },
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
      guardianPhoneNumber: true,
      educationLevel: true,
      educationYearCompleted: true,
      educationGrade: true,
      educationInstitution: true,
      passportPhotoUrl: true,
      birthCertificateUrl: true,
      educationCertificatesUrl: true,
      declarationAccepted: true,
      applicantSignatureName: true,
    },
  });

  if (!application) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your application is not ready yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const progress = getApplicationProgress(application);
  const canEdit = application.status === "DRAFT";
  const step = nextIncompleteStep(progress);
  const currentStep = canEdit ? toStepNumber(step) : 5;
  const applicationHref = canEdit ? `/app/application?step=${step}` : "/app/application";

  const steps = [
    { title: "Binafsi", complete: progress.personalComplete },
    { title: "Mawasiliano", complete: progress.contactComplete },
    { title: "Elimu", complete: progress.educationComplete },
    { title: "Tamko", complete: progress.declarationComplete },
    { title: "Mapitio", complete: !canEdit },
  ];

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight">
              Karibu, {user.fullName}
            </h2>
            <StatusBadge status={application.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Jaza fomu ya maombi hatua kwa hatua na ufuatilie status.
          </p>
        </div>
        <Button asChild>
          <Link href={applicationHref}>
            {canEdit ? "Endelea" : "Fungua maombi"}{" "}
            <ArrowRightIcon className="ml-2 size-4" />
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden border bg-gradient-to-r from-sky-600 to-emerald-500 text-white">
        <CardContent className="grid gap-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="grid gap-1">
              <div className="text-sm text-white/90">Hatua za maombi</div>
              <div className="text-lg font-semibold">
                Kamilisha {progress.completedCount} / {progress.totalCount}
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-white/15 text-white hover:bg-white/15"
            >
              {canEdit ? "Draft" : "Read only"}
            </Badge>
          </div>

          <ApplicationStepper
            steps={steps}
            currentStep={currentStep}
            className="border-white/15 bg-white/10 shadow-none text-white"
          />

          <div className="flex flex-wrap items-center gap-2 text-sm text-white/90">
            <CheckCircle2Icon className="size-4" />
            {canEdit ? (
              <span>
                Next: <span className="font-medium">{step}</span>
              </span>
            ) : (
              <span>Maombi yameshawasilishwa (read-only).</span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileTextIcon className="size-4 text-primary" />
              Muhtasari
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Last update</span>
              <span className="font-medium">{application.updatedAt.toLocaleString()}</span>
            </div>
            <div className="rounded-xl border bg-muted/20 p-3">
              <div className="text-xs text-muted-foreground">Course</div>
              <div className="font-medium">{application.course?.title ?? "-"}</div>
              <div className="text-xs text-muted-foreground">
                {application.course?.duration ?? "Duration not set"}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                College:{" "}
                <span className="font-medium text-foreground">
                  {application.preferredCollege ?? "-"}
                </span>
              </div>
              {application.applicantPoBox ? (
                <div className="mt-1 text-xs text-muted-foreground">
                  S.L.P:{" "}
                  <span className="font-medium text-foreground">
                    {application.applicantPoBox}
                  </span>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCapIcon className="size-4 text-primary" />
              Uhakiki wa hatua
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant={progress.personalComplete ? "default" : "secondary"}>
                Binafsi
              </Badge>
              <Badge variant={progress.contactComplete ? "default" : "secondary"}>
                Mawasiliano
              </Badge>
              <Badge variant={progress.educationComplete ? "default" : "secondary"}>
                Elimu
              </Badge>
              <Badge variant={progress.declarationComplete ? "default" : "secondary"}>
                Tamko
              </Badge>
            </div>
            {!progress.allComplete && canEdit ? (
              <p className="text-sm text-muted-foreground">
                Kamilisha hatua zote kabla ya kuwasilisha.
              </p>
            ) : null}
            <Button asChild variant="outline" className="mt-2 justify-between">
              <Link href={applicationHref}>
                {canEdit ? "Continue" : "View application"}{" "}
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileTextIcon className="size-4 text-primary" />
              Nyaraka
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Passport</span>
              {application.passportPhotoUrl ? (
                <a
                  href={application.passportPhotoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4"
                >
                  View
                </a>
              ) : (
                <Badge variant="secondary">Missing</Badge>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Cheti cha kuzaliwa</span>
              {application.birthCertificateUrl ? (
                <a
                  href={application.birthCertificateUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4"
                >
                  View
                </a>
              ) : (
                <Badge variant="secondary">Missing</Badge>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Vyeti vya elimu</span>
              {application.educationCertificatesUrl ? (
                <a
                  href={application.educationCertificatesUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4"
                >
                  View
                </a>
              ) : (
                <Badge variant="secondary">Missing</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
