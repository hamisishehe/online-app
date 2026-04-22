"use client"

import * as React from "react"
import Link from "next/link"

import { NavUser } from "@/components/nav-user"
import { SidebarNav, type SidebarNavItem } from "@/components/sidebar-nav"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CommandIcon } from "lucide-react"

const applicantItems: SidebarNavItem[] = [
  { title: "Dashboard", href: "/app/dashboard", icon: "dashboard" },
  { title: "Application", href: "/app/application", icon: "application" },
  { title: "Profile", href: "/app/profile", icon: "profile" },
];

const adminItems: SidebarNavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { title: "Applicants", href: "/admin/applicants", icon: "applicants" },
  { title: "Users", href: "/admin/users", icon: "users" },
  { title: "Applications", href: "/admin/applications", icon: "applications" },
  { title: "Reports", href: "/admin/reports", icon: "reports" },
  { title: "CMS", href: "/admin/cms", icon: "settings" },
  { title: "Profile", href: "/admin/profile", icon: "profile" },
];

export function AppSidebar({
  role,
  user,
  portalName,
  logoUrl,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  role: "APPLICANT" | "ADMIN";
  user: { fullName: string; email: string };
  portalName?: string;
  logoUrl?: string | null;
}) {
  const items = role === "ADMIN" ? adminItems : applicantItems;
  const homeHref = role === "ADMIN" ? "/admin/dashboard" : "/app/dashboard";
  const profileHref = role === "ADMIN" ? "/admin/profile" : "/app/profile";

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href={homeHref} prefetch={false} className="flex items-center gap-2">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="size-6 rounded-full object-cover ring-1 ring-border"
                  />
                ) : (
                  <CommandIcon className="size-5!" />
                )}
                <span className="text-base font-semibold">
                  {portalName ?? "Online Application"}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          profileHref={profileHref}
          user={{
            name: user.fullName,
            email: user.email,
            avatar: "/avatars/shadcn.jpg",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
