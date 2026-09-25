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
    <div className="flex h-screen w-full">
      <Sidebar
        userName={session.user.name ?? session.user.email ?? "Người dùng"}
        userRole={ROLE_LABEL[role] ?? role}
        footer={<SignOutButton />}
      />
      <main className="flex-1 overflow-y-auto p-8" style={{ background: "var(--page)" }}>
        <div className="mx-auto max-w-[1280px]">{children}</div>
      </main>
    </div>
  );
}
