"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";

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
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "app-nav-link is-active" : "app-nav-link"}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

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
