export type NavItem = {
  href: string;
  label: string;
  icon: string;
  hidden?: boolean;
};

const allNavItems: NavItem[] = [
  { href: "/", label: "Tổng quan", icon: "layout" },
  { href: "/customers", label: "Chăm sóc khách hàng", icon: "users" },
  { href: "/debt", label: "Công nợ", icon: "wallet" },
  { href: "/email", label: "Email", icon: "mail" },
  { href: "/calendar", label: "Lịch công việc", icon: "check" },
  { href: "/revenue", label: "Doanh thu", icon: "trending", hidden: true },
  { href: "/finance", label: "Tài chính & công nợ", icon: "wallet", hidden: true },
  { href: "/inventory", label: "Nhập kho", icon: "package", hidden: true },
  { href: "/ads", label: "Google Ads", icon: "megaphone", hidden: true },
  { href: "/facebook", label: "Facebook", icon: "thumbs", hidden: true },
];

export const navItems: NavItem[] = allNavItems.filter((i) => !i.hidden);
