export type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Tổng quan", icon: "📊" },
  { href: "/email", label: "Đọc email", icon: "📧" },
  { href: "/customers", label: "Chăm sóc khách hàng", icon: "🧑‍🤝‍🧑" },
  { href: "/inventory", label: "Nhập kho", icon: "📦" },
  { href: "/finance", label: "Tài chính", icon: "💰" },
  { href: "/revenue", label: "Doanh thu", icon: "📈" },
  { href: "/ads", label: "Google Ads", icon: "🔍" },
  { href: "/facebook", label: "Facebook view", icon: "📱" },
  { href: "/calendar", label: "Checklist lịch", icon: "✅" },
];
