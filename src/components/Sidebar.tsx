"use client";

import Link from "next/link";
import { CalendarDays, LayoutDashboard, Mail, UsersRound, Wallet } from "lucide-react";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";

const navIcons = {
  "/": LayoutDashboard,
  "/customers": UsersRound,
  "/debt": Wallet,
  "/email": Mail,
  "/calendar": CalendarDays,
} as const;

const mobileLabels: Record<string, string> = {
  "/": "Tổng quan",
  "/customers": "CSKH",
  "/debt": "Công nợ",
  "/email": "Email",
  "/calendar": "Lịch",
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
    <aside className="app-sidebar">
      <Link href="/" className="dashboard-brand" aria-label="Bao Bì Giấy Toàn Quốc, về trang Tổng quan">
        Bao Bì Giấy Toàn Quốc
        <small>Không gian điều hành</small>
      </Link>

      <nav className="app-nav" aria-label="Điều hướng chính">
        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = navIcons[item.href as keyof typeof navIcons];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "app-nav-link is-active" : "app-nav-link"}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
            >
              {Icon && <Icon className="app-nav-icon" size={19} strokeWidth={1.8} aria-hidden="true" />}
              <span className="app-nav-label">{item.label}</span>
              <span className="app-nav-mobile-label" aria-hidden="true">{mobileLabels[item.href]}</span>
            </Link>
          );
        })}
      </nav>

      <details className="app-mobile-account">
        <summary aria-label={`Tài khoản: ${userName}`}>
          {userName.trim().charAt(0).toLocaleUpperCase("vi-VN") || "N"}
        </summary>
        <div className="app-mobile-account-menu">
          <strong>{userName}</strong>
          <span>{userRole}</span>
          {footer}
        </div>
      </details>

      <div className="app-account">
        <span className="dashboard-avatar" aria-hidden="true">
          {userName.trim().charAt(0).toLocaleUpperCase("vi-VN") || "N"}
        </span>
        <div className="app-account-label">
          <strong>{userName}</strong>
          <span>{userRole}</span>
        </div>
        {footer}
      </div>
    </aside>
  );
}
