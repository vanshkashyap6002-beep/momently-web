"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ShoppingBag,
  FolderKanban,
  LayoutTemplate,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const navItems = [
  { href: "/admin-panel", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin-panel/users", label: "Users", icon: Users },
  { href: "/admin-panel/payments", label: "Payments", icon: CreditCard },
  { href: "/admin-panel/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin-panel/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin-panel/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/admin-panel/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin-panel/settings", label: "Settings", icon: Settings },
];

export function AdminShell({
  adminName,
  children,
}: {
  adminName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarLinks = (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = item.href === "/admin-panel" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-love/10 text-love dark:bg-blush/10 dark:text-blush font-medium"
                : "text-ink/60 hover:bg-ink/5 hover:text-ink dark:text-paper/60 dark:hover:bg-paper/10 dark:hover:text-paper"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink px-4 py-6">
        <Link href="/admin-panel" className="font-display text-lg text-love dark:text-blush px-3 mb-8">
          Momently <span className="text-ink/40 dark:text-paper/40 text-sm font-body">Admin</span>
        </Link>
        {SidebarLinks}
        <div className="mt-auto pt-4 border-t border-ink/10 dark:border-paper/10">
          <p className="px-3 text-xs text-ink/40 dark:text-paper/40 truncate">{adminName}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink/60 hover:bg-ink/5 hover:text-love dark:text-paper/60 dark:hover:bg-paper/10 dark:hover:text-blush transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink px-4 py-3">
        <Link href="/admin-panel" className="font-display text-lg text-love dark:text-blush">
          Momently <span className="text-ink/40 dark:text-paper/40 text-sm font-body">Admin</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="h-10 w-10 flex items-center justify-center rounded-full text-ink/70 hover:bg-ink/5 dark:text-paper/70 dark:hover:bg-paper/10"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden border-b border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink px-4 py-4"
          >
            {SidebarLinks}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink/60 hover:text-love dark:text-paper/60 dark:hover:text-blush transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden lg:flex justify-end sticky top-0 z-30 border-b border-ink/10 dark:border-paper/10 bg-paper/80 dark:bg-ink/80 backdrop-blur-sm px-8 py-3 lg:ml-64">
        <ThemeToggle />
      </div>

      <main className="lg:ml-64 px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
