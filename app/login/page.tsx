import { LoginForm } from "@/app/login/login-form";
import { getCurrentUser } from "@/lib/auth/current-user";
import { redirect } from "next/navigation";
import { getPublicSiteContent } from "@/lib/site";
import { PublicHeader } from "@/components/public-header";

export default async function Page() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin/dashboard" : "/app/dashboard");

  const { settings } = await getPublicSiteContent();
  const portalName = settings?.portalName ?? "Online Application";
  const ctaText = settings?.ctaText ?? "Start application";
  const logoUrl = settings?.logoUrl ?? null;

  return (
    <div className="min-h-full bg-[radial-gradient(1200px_circle_at_50%_-200px,theme(colors.sky.200),transparent_60%),radial-gradient(900px_circle_at_80%_0px,theme(colors.emerald.200),transparent_55%),linear-gradient(to_bottom,theme(colors.background),theme(colors.background))] dark:bg-[radial-gradient(1200px_circle_at_50%_-200px,theme(colors.slate.700),transparent_60%),radial-gradient(900px_circle_at_80%_0px,theme(colors.slate.800),transparent_55%),linear-gradient(to_bottom,theme(colors.background),theme(colors.background))]">
      <PublicHeader portalName={portalName} logoUrl={logoUrl} ctaText={ctaText} user={null} />
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <LoginForm />
      </div>
    </div>
  );
}
