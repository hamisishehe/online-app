import { ApplicationStatus } from "@prisma/client";

export function getStatusLabel(status: ApplicationStatus) {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "SUBMITTED":
      return "Submitted";
    case "UNDER_REVIEW":
      return "Under review";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
}

export function getEducationProgress(app: {
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
}) {
  const primaryComplete =
    !!app.primarySchoolName &&
    !!app.primaryYearFrom &&
    !!app.primaryYearTo &&
    !!app.primaryQualification;
  const secondaryComplete =
    !!app.secondarySchoolName &&
    !!app.secondaryYearFrom &&
    !!app.secondaryYearTo &&
    !!app.secondaryGrade;
  const tertiaryComplete =
    !!app.tertiaryInstitutionName &&
    !!app.tertiaryCourseName &&
    !!app.tertiaryYearFrom &&
    !!app.tertiaryYearTo &&
    !!app.tertiaryGrade;

  const completedCount = [primaryComplete, secondaryComplete, tertiaryComplete].filter(
    Boolean
  ).length;

  return {
    primaryComplete,
    secondaryComplete,
    tertiaryComplete,
    completedCount,
    totalCount: 3,
    allComplete: primaryComplete && secondaryComplete && tertiaryComplete,
  };
}

export function getApplicationProgress(app: {
  courseId: number | null;
  preferredCollege: string | null;
  gender: string | null;
  dateOfBirth: Date | null;
  citizenship: string | null;
  nidaNumber: string | null;
  hasNbcAccount: boolean | null;
  residenceVillageWard: string | null;
  residenceDistrict: string | null;
  guardianFullName: string | null;
  guardianPhoneNumber: string | null;
  educationLevel: string | null;
  educationYearCompleted: number | null;
  educationGrade: string | null;
  educationInstitution: string | null;
  passportPhotoUrl: string | null;
  birthCertificateUrl: string | null;
  educationCertificatesUrl: string | null;
  declarationAccepted: boolean | null;
  applicantSignatureName: string | null;
}) {
  const personalComplete =
    !!app.gender &&
    !!app.dateOfBirth &&
    !!app.citizenship &&
    !!app.nidaNumber &&
    app.hasNbcAccount === true;

  const contactComplete =
    !!app.residenceVillageWard &&
    !!app.residenceDistrict &&
    !!app.guardianFullName &&
    !!app.guardianPhoneNumber;

  const educationComplete =
    !!app.courseId &&
    !!app.preferredCollege &&
    !!app.educationLevel &&
    !!app.educationYearCompleted &&
    !!app.educationGrade &&
    !!app.educationInstitution;

  const declarationComplete =
    !!app.declarationAccepted &&
    !!app.applicantSignatureName &&
    !!app.passportPhotoUrl &&
    !!app.birthCertificateUrl &&
    !!app.educationCertificatesUrl;

  const completedCount = [personalComplete, contactComplete, educationComplete, declarationComplete].filter(Boolean).length;

  return {
    personalComplete,
    contactComplete,
    educationComplete,
    declarationComplete,
    completedCount,
    totalCount: 4,
    allComplete: personalComplete && contactComplete && educationComplete && declarationComplete,
  };
}
