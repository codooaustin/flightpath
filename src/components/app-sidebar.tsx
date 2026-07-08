"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  LogOut,
  LayoutDashboard,
  Map,
  Target,
  Calendar,
  DollarSign,
  BookOpen,
  FolderOpen,
  Settings,
  Plane,
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import type { Profile } from "@/types/models";
import type { LucideIcon } from "lucide-react";

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/missions", label: "Missions", icon: Target },
  { href: "/logbook", label: "Logbook", icon: Plane },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/costs", label: "Costs", icon: DollarSign },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/hangar", label: "Hangar", icon: FolderOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface AppSidebarProps {
  profile: Profile | null;
  logo: React.ReactNode;
}

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sky-100 text-sky-900 dark:bg-sky-900 dark:text-sky-100"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppSidebar({ profile, logo }: AppSidebarProps) {
  const pathname = usePathname();
  const initials = profile?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  return (
    <>
      <aside className="hidden h-full w-64 shrink-0 flex-col border-r bg-card lg:flex">
        <div className="flex h-14 shrink-0 items-center border-b px-4">{logo}</div>
        <div className="flex-1 overflow-hidden p-4">
          <NavLinks pathname={pathname} />
        </div>
        <div className="shrink-0 border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="w-full"
              render={
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">{profile?.name}</span>
                    <span className="text-xs capitalize text-muted-foreground">
                      {profile?.role}
                    </span>
                  </div>
                </Button>
              }
            />
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={() => {
                  document.getElementById("sign-out-form")?.dispatchEvent(
                    new Event("submit", { cancelable: true, bubbles: true })
                  );
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <form id="sign-out-form" action={signOut} className="hidden" />

      <Sheet>
        <SheetTrigger
          className="fixed left-4 top-3 z-50 lg:hidden"
          render={
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          }
        />
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-14 items-center border-b px-4">{logo}</div>
          <div className="p-4">
            <NavLinks pathname={pathname} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
