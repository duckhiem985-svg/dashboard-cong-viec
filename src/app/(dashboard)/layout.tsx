import { auth } from "@/auth";
import { Sidebar } from "@/components/Sidebar";
import { SignOutButton } from "@/components/SignOutButton";
import { redirect } from "next/navigation";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Quản trị",
  SALES: "Sales",
  KETOAN: "Kế toán",
  KHO: "Kho",
  MARKETING: "Marketing",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role ?? "SALES";

  return (
    <div className="dashboard-shell">
      <a className="skip-link" href="#main-content">Bỏ qua điều hướng</a>
      <Sidebar
        userName={session.user.name ?? session.user.email ?? "Người dùng"}
        userRole={ROLE_LABEL[role] ?? role}
        footer={<SignOutButton />}
      />
      <main id="main-content" className="dashboard-main">
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}
