"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import {
  saveContactInfo,
  saveDeclaration,
  saveEducationInfo,
  savePersonalInfo,
  submitApplication,
} from "@/app/actions/application";
import { ApplicationStepper } from "@/components/application-stepper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, ArrowRightIcon, ExternalLinkIcon } from "lucide-react";

type StepKey = "personal" | "contacts" | "education" | "declaration" | "submit";
const stepOrder: StepKey[] = ["personal", "contacts", "education", "declaration", "submit"];

function parseStep(value: string | null): StepKey | null {
  if (!value) return null;
  return (stepOrder as readonly string[]).includes(value) ? (value as StepKey) : null;
}

function defaultStep(progress: {
  personalComplete: boolean;
  contactComplete: boolean;
  educationComplete: boolean;
  declarationComplete: boolean;
}): StepKey {
  if (!progress.personalComplete) return "personal";
  if (!progress.contactComplete) return "contacts";
  if (!progress.educationComplete) return "education";
  if (!progress.declarationComplete) return "declaration";
  return "submit";
}

export function ApplicationForms({
  user,
  application,
  progress,
  courses,
  selectedCourse,
}: {
  user: { fullName: string; email: string; phoneNumber: string };
  application: {
    status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
    submittedAt: string | null;
    adminNote: string | null;
    courseId: number | null;
    preferredCollege: string | null;
    gender: string | null;
    dateOfBirth: string | null;
    citizenship: string | null;
    nidaNumber: string | null;
    hasNbcAccount: boolean;
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
    declarationAccepted: boolean;
    applicantSignatureName: string | null;
    guardianSignatureName: string | null;
  };
  progress: {
    personalComplete: boolean;
    contactComplete: boolean;
    educationComplete: boolean;
    declarationComplete: boolean;
    completedCount: number;
    totalCount: number;
    allComplete: boolean;
  };
  courses: { id: number; title: string; duration: string | null }[];
  selectedCourse: { id: number; title: string; duration: string | null; isActive: boolean } | null;
}) {
  const searchParams = useSearchParams();
  const isDraft = application.status === "DRAFT";
  const requested = parseStep(searchParams.get("step"));

  const step =
    !isDraft
      ? "submit"
      : requested ?? defaultStep(progress);

  const idx = stepOrder.indexOf(step);
  const prevStep = idx > 0 ? stepOrder[idx - 1] : null;

  const steps = [
    { title: "Binafsi", complete: progress.personalComplete },
    { title: "Mawasiliano", complete: progress.contactComplete },
    { title: "Elimu", complete: progress.educationComplete },
    { title: "Tamko", complete: progress.declarationComplete },
    { title: "Mapitio", complete: !isDraft },
  ];

  const currentStepNumber = idx + 1;

  const [personalState, personalAction, personalPending] = useActionState(
    savePersonalInfo,
    undefined
  );
  const [contactState, contactAction, contactPending] = useActionState(
    saveContactInfo,
    undefined
  );
  const [educationState, educationAction, educationPending] = useActionState(
    saveEducationInfo,
    undefined
  );
  const [declarationState, declarationAction, declarationPending] = useActionState(
    saveDeclaration,
    undefined
  );
  const [submitState, submitAction, submitPending] = useActionState(
    submitApplication,
    undefined
  );

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-4">
      <div className="grid gap-1 text-center">
        <h3 className="text-base font-semibold">Fomu ya Maombi</h3>
        <p className="text-sm text-muted-foreground">
          Jaza hatua hizi kwa mpangilio. Sehemu zenye alama (*) zinahitajika.
        </p>
      </div>

      <ApplicationStepper steps={steps} currentStep={currentStepNumber} />

      {!isDraft ? (
        <Card>
          <CardHeader>
            <CardTitle>Maombi yameshawasilishwa</CardTitle>
            <CardDescription>Huwezi kubadilisha taarifa baada ya kuwasilisha.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Read only</Badge>
              <span className="text-muted-foreground">
                Admin ataongeza status na maoni.
              </span>
            </div>
            {application.submittedAt ? (
              <div>
                Submitted:{" "}
                <span className="font-medium">
                  {new Date(application.submittedAt).toLocaleString()}
                </span>
              </div>
            ) : null}
            {application.adminNote ? (
              <div>
                Admin note:{" "}
                <span className="font-medium">{application.adminNote}</span>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {step === "personal" ? (
        <Card>
          <CardHeader>
            <CardTitle>Hatua 1: Taarifa binafsi</CardTitle>
            <CardDescription>Jaza taarifa zako binafsi.</CardDescription>
          </CardHeader>
          <form action={personalAction} className="contents">
            <CardContent className="grid gap-4">
              {personalState?.message ? (
                <p className="text-sm text-destructive">{personalState.message}</p>
              ) : null}

              <div className="grid gap-2">
                <Label>Jina kamili</Label>
                <Input value={user.fullName} readOnly />
                <p className="text-xs text-muted-foreground">
                  Badilisha jina kwenye{" "}
                  <Link href="/app/profile" className="underline underline-offset-4">
                    Profile
                  </Link>
                  .
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="gender">Jinsi *</Label>
                <select
                  id="gender"
                  name="gender"
                  defaultValue={application.gender ?? ""}
                  disabled={!isDraft || personalPending}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="" disabled>
                    Chagua
                  </option>
                  <option value="Me">Me (Kiume)</option>
                  <option value="Ke">Ke (Kike)</option>
                </select>
                {personalState?.errors?.gender?.[0] ? (
                  <p className="text-xs text-destructive">{personalState.errors.gender[0]}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dateOfBirth">Tarehe ya kuzaliwa *</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  defaultValue={application.dateOfBirth ?? ""}
                  disabled={!isDraft || personalPending}
                  required
                />
                {personalState?.errors?.dateOfBirth?.[0] ? (
                  <p className="text-xs text-destructive">
                    {personalState.errors.dateOfBirth[0]}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="citizenship">Uraia *</Label>
                <Input
                  id="citizenship"
                  name="citizenship"
                  defaultValue={application.citizenship ?? "Tanzania"}
                  disabled={!isDraft || personalPending}
                  required
                />
                {personalState?.errors?.citizenship?.[0] ? (
                  <p className="text-xs text-destructive">
                    {personalState.errors.citizenship[0]}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="nidaNumber">Namba ya NIDA/Leseni *</Label>
                <Input
                  id="nidaNumber"
                  name="nidaNumber"
                  defaultValue={application.nidaNumber ?? ""}
                  disabled={!isDraft || personalPending}
                  required
                />
                {personalState?.errors?.nidaNumber?.[0] ? (
                  <p className="text-xs text-destructive">
                    {personalState.errors.nidaNumber[0]}
                  </p>
                ) : null}
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="hasNbcAccount"
                  defaultChecked={application.hasNbcAccount}
                  disabled={!isDraft || personalPending}
                  required
                  className="h-4 w-4 rounded border border-input bg-background align-middle text-primary shadow-xs focus-visible:ring-2 focus-visible:ring-ring"
                />
                Nina akaunti ya NBC (au niko tayari kufungua baada ya kuchaguliwa)
              </label>
              {personalState?.errors?.hasNbcAccount?.[0] ? (
                <p className="text-xs text-destructive">
                  {personalState.errors.hasNbcAccount[0]}
                </p>
              ) : null}
            </CardContent>
            <CardFooter className="justify-between">
              <Button type="button" variant="outline" disabled>
                <ArrowLeftIcon className="mr-2 size-4" />
                Rudi Nyuma
              </Button>
              <Button type="submit" disabled={!isDraft || personalPending}>
                {personalPending ? "Saving..." : "Endelea"}
                <ArrowRightIcon className="ml-2 size-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : null}

      {step === "contacts" ? (
        <Card>
          <CardHeader>
            <CardTitle>Hatua 2: Mawasiliano</CardTitle>
            <CardDescription>Jaza taarifa za mawasiliano.</CardDescription>
          </CardHeader>
          <form action={contactAction} className="contents">
            <CardContent className="grid gap-4">
              {contactState?.message ? (
                <p className="text-sm text-destructive">{contactState.message}</p>
              ) : null}

              <div className="grid gap-2">
                <Label>Namba ya simu</Label>
                <Input value={user.phoneNumber} readOnly />
              </div>
              <div className="grid gap-2">
                <Label>Barua pepe</Label>
                <Input value={user.email} readOnly />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="applicantPoBox">S.L.P (hiari)</Label>
                <Input
                  id="applicantPoBox"
                  name="applicantPoBox"
                  defaultValue={application.applicantPoBox ?? ""}
                  disabled={!isDraft || contactPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="residenceVillageWard">Kijiji/Kata *</Label>
                <Input
                  id="residenceVillageWard"
                  name="residenceVillageWard"
                  defaultValue={application.residenceVillageWard ?? ""}
                  disabled={!isDraft || contactPending}
                  required
                />
                {contactState?.errors?.residenceVillageWard?.[0] ? (
                  <p className="text-xs text-destructive">
                    {contactState.errors.residenceVillageWard[0]}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="residenceDistrict">Wilaya *</Label>
                <Input
                  id="residenceDistrict"
                  name="residenceDistrict"
                  defaultValue={application.residenceDistrict ?? ""}
                  disabled={!isDraft || contactPending}
                  required
                />
                {contactState?.errors?.residenceDistrict?.[0] ? (
                  <p className="text-xs text-destructive">
                    {contactState.errors.residenceDistrict[0]}
                  </p>
                ) : null}
              </div>

              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="mb-3 text-sm font-medium">Mzazi/Mlezi/Mfadhili</div>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="guardianFullName">Jina *</Label>
                    <Input
                      id="guardianFullName"
                      name="guardianFullName"
                      defaultValue={application.guardianFullName ?? ""}
                      disabled={!isDraft || contactPending}
                      required
                    />
                    {contactState?.errors?.guardianFullName?.[0] ? (
                      <p className="text-xs text-destructive">
                        {contactState.errors.guardianFullName[0]}
                      </p>
                    ) : null}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="guardianPoBox">S.L.P (hiari)</Label>
                    <Input
                      id="guardianPoBox"
                      name="guardianPoBox"
                      defaultValue={application.guardianPoBox ?? ""}
                      disabled={!isDraft || contactPending}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="guardianPhoneNumber">Namba ya simu *</Label>
                    <Input
                      id="guardianPhoneNumber"
                      name="guardianPhoneNumber"
                      defaultValue={application.guardianPhoneNumber ?? ""}
                      disabled={!isDraft || contactPending}
                      required
                    />
                    {contactState?.errors?.guardianPhoneNumber?.[0] ? (
                      <p className="text-xs text-destructive">
                        {contactState.errors.guardianPhoneNumber[0]}
                      </p>
                    ) : null}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="guardianEmail">Barua pepe (hiari)</Label>
                    <Input
                      id="guardianEmail"
                      name="guardianEmail"
                      defaultValue={application.guardianEmail ?? ""}
                      disabled={!isDraft || contactPending}
                      placeholder="mfano@barua.com"
                    />
                    {contactState?.errors?.guardianEmail?.[0] ? (
                      <p className="text-xs text-destructive">
                        {contactState.errors.guardianEmail[0]}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              {prevStep ? (
                <Button asChild type="button" variant="outline">
                  <Link href={`/app/application?step=${prevStep}`}>
                    <ArrowLeftIcon className="mr-2 size-4" />
                    Rudi Nyuma
                  </Link>
                </Button>
              ) : (
                <Button type="button" variant="outline" disabled>
                  <ArrowLeftIcon className="mr-2 size-4" />
                  Rudi Nyuma
                </Button>
              )}
              <Button type="submit" disabled={!isDraft || contactPending}>
                {contactPending ? "Saving..." : "Endelea"}
                <ArrowRightIcon className="ml-2 size-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : null}

      {step === "education" ? (
        <Card>
          <CardHeader>
            <CardTitle>Hatua 3: Elimu & Chaguo</CardTitle>
            <CardDescription>Chagua kozi na jaza elimu yako ya juu.</CardDescription>
          </CardHeader>
          <form action={educationAction} className="contents">
            <CardContent className="grid gap-4">
              {educationState?.message ? (
                <p className="text-sm text-destructive">{educationState.message}</p>
              ) : null}

              <div className="grid gap-2">
                <Label htmlFor="courseId">Kozi (Fani) *</Label>
                <select
                  id="courseId"
                  name="courseId"
                  defaultValue={application.courseId ?? ""}
                  disabled={!isDraft || educationPending || courses.length === 0}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="" disabled>
                    {courses.length === 0 ? "Hakuna kozi" : "Chagua kozi"}
                  </option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                      {c.duration ? ` (${c.duration})` : ""}
                    </option>
                  ))}
                </select>
                {educationState?.errors?.courseId?.[0] ? (
                  <p className="text-xs text-destructive">
                    {educationState.errors.courseId[0]}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="preferredCollege">Chuo unachopenda *</Label>
                <select
                  id="preferredCollege"
                  name="preferredCollege"
                  defaultValue={application.preferredCollege ?? ""}
                  disabled={!isDraft || educationPending}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="" disabled>
                    Chagua chuo
                  </option>
                  <option value="VETA Kihonda">VETA Kihonda</option>
                  <option value="VETA Mwanza">VETA Mwanza</option>
                </select>
                {educationState?.errors?.preferredCollege?.[0] ? (
                  <p className="text-xs text-destructive">
                    {educationState.errors.preferredCollege[0]}
                  </p>
                ) : null}
              </div>

              {selectedCourse ? (
                <div className="rounded-xl border bg-muted/20 p-4 text-sm">
                  <div className="font-medium">{selectedCourse.title}</div>
                  <div className="text-muted-foreground">
                    {selectedCourse.duration ?? "Duration not set"}
                    {!selectedCourse.isActive ? " • Inactive" : null}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-2">
                <Label htmlFor="educationLevel">Kiwango cha juu cha elimu *</Label>
                <Input
                  id="educationLevel"
                  name="educationLevel"
                  defaultValue={application.educationLevel ?? ""}
                  disabled={!isDraft || educationPending}
                  required
                  placeholder="mfano: Sekondari / Cheti / Diploma"
                />
                {educationState?.errors?.educationLevel?.[0] ? (
                  <p className="text-xs text-destructive">
                    {educationState.errors.educationLevel[0]}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="educationYearCompleted">Mwaka uliohitimu *</Label>
                <Input
                  id="educationYearCompleted"
                  name="educationYearCompleted"
                  type="number"
                  defaultValue={application.educationYearCompleted ?? ""}
                  disabled={!isDraft || educationPending}
                  required
                />
                {educationState?.errors?.educationYearCompleted?.[0] ? (
                  <p className="text-xs text-destructive">
                    {educationState.errors.educationYearCompleted[0]}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="educationGrade">Ufaulu uliopata *</Label>
                <Input
                  id="educationGrade"
                  name="educationGrade"
                  defaultValue={application.educationGrade ?? ""}
                  disabled={!isDraft || educationPending}
                  required
                  placeholder="mfano: Division I / VC1"
                />
                {educationState?.errors?.educationGrade?.[0] ? (
                  <p className="text-xs text-destructive">
                    {educationState.errors.educationGrade[0]}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="educationInstitution">Jina la shule/chuo *</Label>
                <Input
                  id="educationInstitution"
                  name="educationInstitution"
                  defaultValue={application.educationInstitution ?? ""}
                  disabled={!isDraft || educationPending}
                  required
                />
                {educationState?.errors?.educationInstitution?.[0] ? (
                  <p className="text-xs text-destructive">
                    {educationState.errors.educationInstitution[0]}
                  </p>
                ) : null}
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              {prevStep ? (
                <Button asChild type="button" variant="outline">
                  <Link href={`/app/application?step=${prevStep}`}>
                    <ArrowLeftIcon className="mr-2 size-4" />
                    Rudi Nyuma
                  </Link>
                </Button>
              ) : (
                <Button type="button" variant="outline" disabled>
                  <ArrowLeftIcon className="mr-2 size-4" />
                  Rudi Nyuma
                </Button>
              )}
              <Button type="submit" disabled={!isDraft || educationPending}>
                {educationPending ? "Saving..." : "Endelea"}
                <ArrowRightIcon className="ml-2 size-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : null}

      {step === "declaration" ? (
        <Card>
          <CardHeader>
            <CardTitle>Hatua 4: Tamko & Viambatanisho</CardTitle>
            <CardDescription>Pakia nyaraka na kubali tamko.</CardDescription>
          </CardHeader>
          <form action={declarationAction} encType="multipart/form-data" className="contents">
            <CardContent className="grid gap-4">
              {declarationState?.message ? (
                <p className="text-sm text-destructive">{declarationState.message}</p>
              ) : null}

              <div className="grid gap-2">
                <Label htmlFor="passportPhotoFile">Picha ya passport *</Label>
                <Input
                  id="passportPhotoFile"
                  name="passportPhotoFile"
                  type="file"
                  accept="image/*"
                  disabled={!isDraft || declarationPending}
                />
                {application.passportPhotoUrl ? (
                  <a
                    href={application.passportPhotoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLinkIcon className="size-3" />
                    View current upload
                  </a>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="birthCertificateFile">Cheti cha kuzaliwa *</Label>
                <Input
                  id="birthCertificateFile"
                  name="birthCertificateFile"
                  type="file"
                  accept="image/*,application/pdf"
                  disabled={!isDraft || declarationPending}
                />
                {application.birthCertificateUrl ? (
                  <a
                    href={application.birthCertificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLinkIcon className="size-3" />
                    View current upload
                  </a>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="educationCertificatesFile">Vyeti vya elimu *</Label>
                <Input
                  id="educationCertificatesFile"
                  name="educationCertificatesFile"
                  type="file"
                  accept="image/*,application/pdf"
                  disabled={!isDraft || declarationPending}
                />
                {application.educationCertificatesUrl ? (
                  <a
                    href={application.educationCertificatesUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLinkIcon className="size-3" />
                    View current upload
                  </a>
                ) : null}
              </div>

              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  name="declarationAccepted"
                  defaultChecked={application.declarationAccepted}
                  className="mt-0.5 h-4 w-4 rounded border border-input bg-background align-middle text-primary shadow-xs focus-visible:ring-2 focus-visible:ring-ring"
                />
                <span>
                  Nathibitisha kuwa nimesoma na kuelewa yote yaliyo katika fomu hii, na taarifa nilizotoa ni sahihi. *
                </span>
              </label>
              {declarationState?.errors?.declarationAccepted?.[0] ? (
                <p className="text-xs text-destructive">
                  {declarationState.errors.declarationAccepted[0]}
                </p>
              ) : null}

              <div className="grid gap-2">
                <Label htmlFor="applicantSignatureName">Jina la saini ya mwombaji *</Label>
                <Input
                  id="applicantSignatureName"
                  name="applicantSignatureName"
                  defaultValue={application.applicantSignatureName ?? user.fullName}
                  disabled={!isDraft || declarationPending}
                  required
                />
                {declarationState?.errors?.applicantSignatureName?.[0] ? (
                  <p className="text-xs text-destructive">
                    {declarationState.errors.applicantSignatureName[0]}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="guardianSignatureName">Jina la saini ya mzazi/mlezi (hiari)</Label>
                <Input
                  id="guardianSignatureName"
                  name="guardianSignatureName"
                  defaultValue={application.guardianSignatureName ?? ""}
                  disabled={!isDraft || declarationPending}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              {prevStep ? (
                <Button asChild type="button" variant="outline">
                  <Link href={`/app/application?step=${prevStep}`}>
                    <ArrowLeftIcon className="mr-2 size-4" />
                    Rudi Nyuma
                  </Link>
                </Button>
              ) : (
                <Button type="button" variant="outline" disabled>
                  <ArrowLeftIcon className="mr-2 size-4" />
                  Rudi Nyuma
                </Button>
              )}
              <Button type="submit" disabled={!isDraft || declarationPending}>
                {declarationPending ? "Saving..." : "Endelea"}
                <ArrowRightIcon className="ml-2 size-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : null}

      {step === "submit" ? (
        <Card>
          <CardHeader>
            <CardTitle>Hatua 5: Mapitio & Kuwasilisha</CardTitle>
            <CardDescription>Kagua taarifa zako kisha wasilisha maombi.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {submitState?.message ? (
              <p className="text-sm text-destructive">{submitState.message}</p>
            ) : null}

            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="font-medium">Kozi</div>
              <div className="text-muted-foreground">
                {selectedCourse
                  ? `${selectedCourse.title}${selectedCourse.duration ? ` (${selectedCourse.duration})` : ""}`
                  : "-"}
              </div>
              <div className="mt-1 text-muted-foreground">
                Chuo: {application.preferredCollege ?? "-"}
              </div>
            </div>

            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="font-medium">Uhakiki wa hatua</div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Badge variant={progress.personalComplete ? "default" : "secondary"}>Binafsi</Badge>
                <Badge variant={progress.contactComplete ? "default" : "secondary"}>Mawasiliano</Badge>
                <Badge variant={progress.educationComplete ? "default" : "secondary"}>Elimu</Badge>
                <Badge variant={progress.declarationComplete ? "default" : "secondary"}>Tamko</Badge>
              </div>
            </div>

            {!progress.allComplete ? (
              <p className="text-sm text-muted-foreground">
                Kamilisha hatua zote kabla ya kuwasilisha.
              </p>
            ) : null}
          </CardContent>
          <CardFooter className="justify-between">
            {prevStep ? (
              <Button asChild type="button" variant="outline">
                <Link href={`/app/application?step=${prevStep}`}>
                  <ArrowLeftIcon className="mr-2 size-4" />
                  Rudi Nyuma
                </Link>
              </Button>
            ) : (
              <Button type="button" variant="outline" disabled>
                <ArrowLeftIcon className="mr-2 size-4" />
                Rudi Nyuma
              </Button>
            )}
            <form action={submitAction}>
              <Button type="submit" disabled={!isDraft || !progress.allComplete || submitPending}>
                {submitPending ? "Submitting..." : "Wasilisha maombi"}
              </Button>
            </form>
          </CardFooter>
        </Card>
      ) : null}
    </div>
  );
}
