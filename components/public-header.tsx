import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";

export function PublicHeader({
  portalName,
  logoUrl,
  ctaText,
  user,
}: {
  portalName: string;
  logoUrl: string | null;
  ctaText: string;
  user: { dashboardHref: string } | null;
}) {
  return (
    <header className="sticky top-0 z-20 border-b bg-[var(--app-header-bg,var(--background))] text-[var(--app-header-fg,var(--foreground))] backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 ring-1 ring-border" />
          )}
          <div className="leading-tight">
            <div className="text-sm font-semibold">{portalName}</div>
            <div className="text-xs opacity-80">Application Portal</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link
            href="/#home"
            className="opacity-80 hover:opacity-100"
          >
            Home
          </Link>
          <Link
            href="/#courses"
            className="opacity-80 hover:opacity-100"
          >
            Courses
          </Link>
          <Link
            href="/#how"
            className="opacity-80 hover:opacity-100"
          >
            How it works
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild>
              <Link href={user.dashboardHref}>
                Dashboard <ArrowRightIcon className="ml-2 size-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">{ctaText}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
