"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Wallet,
  Package,
  Megaphone,
  ThumbsUp,
  Mail,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { navItems } from "@/lib/nav";

const icons: Record<string, LucideIcon> = {
  layout: LayoutDashboard,
  users: Users,
  trending: TrendingUp,
  wallet: Wallet,
  package: Package,
  megaphone: Megaphone,
  thumbs: ThumbsUp,
  mail: Mail,
  check: ListChecks,
};

export function Sidebar({
  userName,
  userRole,
  footer,
}: {
  userName: string;
  userRole: string;
  footer?: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <aside
      className="flex h-screen w-64 shrink-0 flex-col"
      style={{ background: "var(--nav-bg)" }}
    >
      <div className="px-5 py-5">
        <p className="text-[15px] font-semibold text-white">Bao Bì Giấy Toàn Quốc</p>
        <p className="mt-0.5 text-xs" style={{ color: "var(--nav-text)" }}>
          Dashboard theo dõi công việc
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {navItems.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = icons[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
              style={{
                background: active ? "var(--nav-active)" : "transparent",
                color: active ? "#ffffff" : "var(--nav-text)",
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div
        className="mx-3 mb-2 rounded-lg px-3 py-3"
        style={{ background: "var(--nav-active)" }}
      >
        <p className="truncate text-sm font-medium text-white">{userName}</p>
        <p className="text-xs" style={{ color: "var(--nav-text)" }}>
          {userRole}
        </p>
      </div>
      {footer}
    </aside>
  );
}
