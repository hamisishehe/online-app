"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  FileTextIcon,
  UserRoundIcon,
  UsersIcon,
  ListChecksIcon,
  SettingsIcon,
  BarChart3Icon,
} from "lucide-react";

export type SidebarNavItem = {
  title: string;
  href: string;
  icon: SidebarNavIcon;
};

const iconMap = {
  dashboard: LayoutDashboardIcon,
  application: FileTextIcon,
  profile: UserRoundIcon,
  applicants: UsersIcon,
  users: UsersIcon,
  applications: ListChecksIcon,
  reports: BarChart3Icon,
  settings: SettingsIcon,
} as const;

export type SidebarNavIcon = keyof typeof iconMap;

export function SidebarNav({ items }: { items: SidebarNavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                  <Link href={item.href} prefetch={false}>
                    <Icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
