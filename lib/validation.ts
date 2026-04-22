import { z } from "zod";

export type FormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required.").trim(),
  email: z.string().email("Enter a valid email.").trim().toLowerCase(),
  phoneNumber: z.string().min(7, "Phone number is required.").trim(),
  password: z.string().min(8, "Password must be at least 8 characters.").trim(),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email.").trim().toLowerCase(),
  password: z.string().min(1, "Password is required.").trim(),
});

export const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required.").trim(),
  phoneNumber: z.string().min(7, "Phone number is required.").trim(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required.").trim(),
  newPassword: z.string().min(8, "New password must be at least 8 characters.").trim(),
});

const yearSchema = z.coerce
  .number()
  .int("Enter a valid year.")
  .min(1900, "Year looks too early.")
  .max(new Date().getFullYear() + 10, "Year looks too late.");

export const primaryEducationSchema = z.object({
  primarySchoolName: z.string().min(2, "Primary school name is required.").trim(),
  primaryYearFrom: yearSchema,
  primaryYearTo: yearSchema,
  primaryQualification: z.string().min(2, "Qualification is required.").trim(),
});

export const secondaryEducationSchema = z.object({
  secondarySchoolName: z.string().min(2, "Secondary school name is required.").trim(),
  secondaryYearFrom: yearSchema,
  secondaryYearTo: yearSchema,
  secondaryGrade: z.string().min(1, "Grade is required.").trim(),
});

export const tertiaryEducationSchema = z.object({
  tertiaryInstitutionName: z
    .string()
    .min(2, "Institution name is required.")
    .trim(),
  tertiaryCourseName: z.string().min(2, "Course name is required.").trim(),
  tertiaryYearFrom: yearSchema,
  tertiaryYearTo: yearSchema,
  tertiaryGrade: z.string().min(1, "Grade is required.").trim(),
});

export const selectCourseSchema = z.object({
  courseId: z.coerce.number().int().positive("Select a course."),
});

export const personalInfoSchema = z.object({
  gender: z.enum(["Me", "Ke"], { message: "Chagua jinsi." }),
  dateOfBirth: z
    .string()
    .min(1, "Chagua tarehe ya kuzaliwa.")
    .refine((value) => {
      const dob = new Date(value);
      if (Number.isNaN(dob.getTime())) return false;

      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age -= 1;
      }

      return age >= 18;
    }, "Mwombaji lazima awe na umri wa miaka 18 au zaidi."),
  citizenship: z.string().min(2, "Uraia unahitajika.").trim(),
  nidaNumber: z.string().min(4, "Weka NIDA/Leseni.").trim(),
  hasNbcAccount: z
    .enum(["on"], { message: "Thibitisha akaunti ya NBC." })
    .transform((v) => v === "on"),
});

export const contactInfoSchema = z.object({
  applicantPoBox: z.string().trim().optional(),
  residenceVillageWard: z.string().min(2, "Kijiji/Kata inahitajika.").trim(),
  residenceDistrict: z.string().min(2, "Wilaya inahitajika.").trim(),
  guardianFullName: z.string().min(2, "Jina la mzazi/mlezi linahitajika.").trim(),
  guardianPoBox: z.string().trim().optional(),
  guardianPhoneNumber: z.string().min(7, "Namba ya simu inahitajika.").trim(),
  guardianEmail: z.string().email("Barua pepe si sahihi.").trim().optional().or(z.literal("")),
});

export const educationStepSchema = z.object({
  courseId: z.coerce.number().int().positive("Chagua kozi."),
  preferredCollege: z.enum(["VETA Kihonda", "VETA Mwanza"], {
    message: "Chagua chuo.",
  }),
  educationLevel: z.string().min(2, "Kiwango cha elimu kinahitajika.").trim(),
  educationYearCompleted: yearSchema,
  educationGrade: z.string().min(1, "Ufaulu unahitajika.").trim(),
  educationInstitution: z
    .string()
    .min(2, "Jina la shule/chuo linahitajika.")
    .trim(),
});

export const declarationSchema = z.object({
  declarationAccepted: z
    .enum(["on"], { message: "Kubaliana na tamko." })
    .transform((v) => v === "on"),
  applicantSignatureName: z
    .string()
    .min(2, "Weka jina la saini ya mwombaji.")
    .trim(),
  guardianSignatureName: z.string().trim().optional(),
});

export const siteSettingsSchema = z.object({
  portalName: z.string().min(2, "Portal name is required.").trim(),
  heroTitle: z.string().min(2, "Hero title is required.").trim(),
  heroDescription: z.string().min(10, "Hero description is required.").trim(),
  ctaText: z.string().min(2, "CTA text is required.").trim(),
  logoUrl: z.string().trim().optional(),
  heroImageUrl: z.string().trim().optional(),
  primaryTheme: z.string().trim().optional().default("sky"),
  sidebarTheme: z.string().trim().optional().default("light"),
  headerTheme: z.string().trim().optional().default("default"),
});

export const createCourseSchema = z.object({
  title: z.string().min(2, "Title is required.").trim(),
  duration: z.string().trim().optional(),
  description: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
});

export const updateCourseSchema = createCourseSchema.extend({
  courseId: z.coerce.number().int().positive(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v ? v === "true" : undefined)),
});
