import { signOut } from "@/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
      className="border-t border-slate-200 p-3"
    >
      <button
        type="submit"
        className="block w-full rounded-md px-3 py-2 text-center text-sm font-medium text-slate-500 hover:bg-slate-100"
      >
        Đăng xuất
      </button>
    </form>
  );
}
