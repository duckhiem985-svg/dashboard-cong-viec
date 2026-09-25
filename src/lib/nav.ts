export type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Tổng quan", icon: "layout" },
  { href: "/customers", label: "Chăm sóc khách hàng", icon: "users" },
  { href: "/revenue", label: "Doanh thu", icon: "trending" },
  { href: "/finance", label: "Tài chính & công nợ", icon: "wallet" },
  { href: "/inventory", label: "Nhập kho", icon: "package" },
  { href: "/ads", label: "Google Ads", icon: "megaphone" },
  { href: "/facebook", label: "Facebook", icon: "thumbs" },
  { href: "/email", label: "Email", icon: "mail" },
  { href: "/calendar", label: "Checklist lịch", icon: "check" },
];
