"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Settings,
  Globe,
} from "lucide-react";

interface AdminSidebarProps {
  stats?: {
    totalGroups: number;
    totalWords: number;
    totalTranslations: number;
    totalUsers: number;
  };
}

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Groups",
    href: "/admin/groups",
    icon: FolderOpen,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
];

export function AdminSidebar({ stats }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-card">
      <div className="flex h-full flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Admin</h2>
          <p className="text-sm text-muted-foreground">Management</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {stats && (
          <div className="p-4 border-t space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">
              Overview
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <FolderOpen className="h-3 w-3" />
                  Groups
                </span>
                <span className="font-medium">{stats.totalGroups}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  Words
                </span>
                <span className="font-medium">{stats.totalWords}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  Translations
                </span>
                <span className="font-medium">{stats.totalTranslations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  Users
                </span>
                <span className="font-medium">{stats.totalUsers}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}