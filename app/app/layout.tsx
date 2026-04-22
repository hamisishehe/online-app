import { requireApplicant } from "@/lib/auth/current-user";
import { getPublicSiteContent } from "@/lib/site";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireApplicant();
  const { settings } = await getPublicSiteContent();
  const portalName = settings?.portalName ?? "Online Application";
  const logoUrl = settings?.logoUrl ?? null;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        role={user.role}
        user={{ fullName: user.fullName, email: user.email }}
        portalName={portalName}
        logoUrl={logoUrl}
        variant="inset"
      />
      <SidebarInset>
        <SiteHeader title={portalName} subtitle="Applicant portal" />
        <main className="flex flex-1 flex-col bg-muted/20">
          <div className="mx-auto w-full max-w-6xl p-4 lg:p-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
