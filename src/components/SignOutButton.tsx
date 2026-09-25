import { signOut } from "@/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
      className="px-3 pb-4"
    >
      <button
        type="submit"
        className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-white/10"
        style={{ color: "var(--nav-text)" }}
      >
        Đăng xuất
      </button>
    </form>
  );
}
