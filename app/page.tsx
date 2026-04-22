import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getPublicSiteContent } from "@/lib/site";
import { PublicHeader } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  FileTextIcon,
  GraduationCapIcon,
  ShieldCheckIcon,
} from "lucide-react";

type PublicCourse = {
  id: number;
  title: string;
  duration: string | null;
  description: string | null;
  imageUrl: string | null;
};

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4">{children}</div>;
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto grid max-w-2xl gap-2 text-center">
      <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="text-pretty text-sm text-muted-foreground md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function CourseCard({
  index,
  title,
  duration,
  description,
  imageUrl,
}: {
  index: number;
  title: string;
  duration?: string | null;
  description?: string | null;
  imageUrl?: string | null;
}) {
  return (
    <Card className="group overflow-hidden shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {imageUrl ? (
        <div className="relative h-40 w-full">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        </div>
      ) : null}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {index}
            </div>
            <div className="grid gap-1">
              <CardTitle className="text-base leading-6">{title}</CardTitle>
              {duration ? (
                <Badge className="w-fit" variant="secondary">
                  {duration}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-muted-foreground">
        {description?.length ? description : ""}
      </CardContent>
    </Card>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="grid gap-2 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="font-medium">{title}</div>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default async function Home() {
  const user = await getCurrentUser();
  const { settings, courses } = await getPublicSiteContent();

  const portalName = settings?.portalName ?? "Online Application";
  const heroTitle = settings?.heroTitle ?? "Apply for short courses";
  const heroDescription =
    settings?.heroDescription ??
    "Create an account, fill your education details, and submit your application.";
  const ctaText = settings?.ctaText ?? "Start application";
  const logoUrl = settings?.logoUrl ?? null;
  const heroImageUrl = settings?.heroImageUrl ?? null;

  const dashboardHref =
    user?.role === "ADMIN" ? "/admin/dashboard" : "/app/dashboard";

  const primaryCtaHref = user ? dashboardHref : "/register";
  const primaryCtaLabel = user ? "Continue" : ctaText;
  const secondaryCtaHref = user ? "/#courses" : "/login";
  const secondaryCtaLabel = user ? "View courses" : "Login";

  const courseList: PublicCourse[] =
    courses.length > 0
      ? courses.map((c) => ({
          id: c.id,
          title: c.title,
          duration: c.duration ?? null,
          description: c.description ?? null,
          imageUrl: c.imageUrl ?? null,
        }))
      : [
          {
            id: 0,
            title: "Course 1",
            duration: "4 weeks",
            description: "Add real courses from Admin → CMS.",
            imageUrl: null,
          },
        ];

  return (
    <div className="min-h-full bg-[radial-gradient(1200px_circle_at_50%_-200px,theme(colors.sky.200),transparent_60%),radial-gradient(900px_circle_at_80%_0px,theme(colors.emerald.200),transparent_55%),linear-gradient(to_bottom,theme(colors.background),theme(colors.background))] dark:bg-[radial-gradient(1200px_circle_at_50%_-200px,theme(colors.slate.700),transparent_60%),radial-gradient(900px_circle_at_80%_0px,theme(colors.slate.800),transparent_55%),linear-gradient(to_bottom,theme(colors.background),theme(colors.background))]">
      <PublicHeader
        portalName={portalName}
        logoUrl={logoUrl}
        ctaText={ctaText}
        user={user ? { dashboardHref } : null}
      />

      <main className="flex flex-col gap-16 py-10 md:py-14">
        <section id="home" className="pt-2">
          <Container>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="grid gap-5">
                <Badge className="w-fit" variant="secondary">
                  Simple • Fast • Secure
                </Badge>
                <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                  {heroTitle}
                </h1>
                <div
                  className="max-w-prose text-pretty text-base leading-7 text-muted-foreground md:text-lg [&_a]:underline [&_a]:underline-offset-4 [&_ul]:ml-5 [&_ul]:list-disc [&_ol]:ml-5 [&_ol]:list-decimal [&_strong]:text-foreground"
                  dangerouslySetInnerHTML={{ __html: heroDescription }}
                />
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href={primaryCtaHref}>
                      {primaryCtaLabel}{" "}
                      <ArrowRightIcon className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
                  </Button>
                  {!user ? (
                    <Button asChild size="lg" variant="ghost">
                      <a href="#courses">Browse courses</a>
                    </Button>
                  ) : null}
                </div>

                <div className="grid gap-2 rounded-xl border bg-background/50 p-4 text-sm text-muted-foreground shadow-sm backdrop-blur">
                  <div className="flex items-center gap-2">
                    <CheckCircle2Icon className="size-4 text-primary" />
                    Register with full name, email, phone, and password
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2Icon className="size-4 text-primary" />
                    Fill education details step-by-step
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2Icon className="size-4 text-primary" />
                    Track your application status anytime
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-sky-200/40 via-transparent to-emerald-200/40 blur-2xl dark:from-slate-700/40 dark:to-slate-800/40" />
                <Card className="relative overflow-hidden rounded-3xl border bg-background/60 shadow-sm backdrop-blur">
                  <div className="grid gap-4 p-6">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium">Courses preview</div>
                      <Badge variant="secondary">{courseList.length} courses</Badge>
                    </div>
                    <div className="grid gap-3">
                      {courseList.slice(0, 3).map((c, i) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between gap-3 rounded-xl border bg-background/70 p-3 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                              {i + 1}
                            </div>
                            <div className="text-sm font-medium">{c.title}</div>
                          </div>
                          {c.duration ? (
                            <Badge variant="secondary">{c.duration}</Badge>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  {heroImageUrl ? (
                    <div className="h-64 w-full border-t">
                      <img
                        src={heroImageUrl}
                        alt="Hero"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="grid gap-2 border-t p-6 text-sm text-muted-foreground">
                     
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </Container>
        </section>

        <section id="courses" className="grid gap-6">
          <Container>
            <SectionHeading
              title="Courses offered"
              description="Choose a course and start your application."
            />

            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courseList.map((course, idx) => (
                <CourseCard
                  key={course.id}
                  index={idx + 1}
                  title={course.title}
                  duration={course.duration}
                  description={course.description}
                  imageUrl={course.imageUrl}
                />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Card className="w-full overflow-hidden rounded-2xl border bg-gradient-to-r from-sky-600 to-emerald-500 text-white shadow-sm">
                <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                  <div className="text-xl font-semibold">Ready to apply?</div>
                  <p className="max-w-xl text-sm text-white/90">
                    Create an account, complete your education details, and submit
                    your application in a few minutes.
                  </p>
                  <Button asChild size="lg" variant="secondary">
                    <Link href={user ? dashboardHref : "/register"}>
                      {user ? "Go to dashboard" : "Start now"}{" "}
                      <ArrowRightIcon className="ml-2 size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </Container>
        </section>

        <section id="how" className="py-2">
          <Container>
            <SectionHeading
              title="How it works"
              description="A simple process from registration to review."
            />

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <FeatureCard
                icon={<FileTextIcon className="size-5" />}
                title="1. Register"
                description="Create your account using full name, email, phone number and password."
              />
              <FeatureCard
                icon={<GraduationCapIcon className="size-5" />}
                title="2. Fill education"
                description="Complete each education step in order until everything is filled."
              />
              <FeatureCard
                icon={<ShieldCheckIcon className="size-5" />}
                title="3. Submit & track"
                description="Submit your application and track status updates from the admin."
              />
            </div>
          </Container>
        </section>

        <footer className="border-t py-10">
          <Container>
            <div className="grid gap-6 md:grid-cols-3 md:items-start">
              <div className="grid gap-2">
                <div className="text-sm font-semibold">{portalName}</div>
                <div className="text-sm text-muted-foreground">
                  Portal for course applications.
                </div>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="font-medium">Links</div>
                <a href="#home" className="text-muted-foreground hover:text-foreground">
                  Home
                </a>
                <a
                  href="#courses"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Courses
                </a>
                <a href="#how" className="text-muted-foreground hover:text-foreground">
                  How it works
                </a>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="font-medium">Account</div>
                {user ? (
                  <Link
                    href={dashboardHref}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {ctaText}
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="mt-8 text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} {portalName}. All rights reserved.
            </div>
          </Container>
        </footer>
      </main>
    </div>
  );
}
