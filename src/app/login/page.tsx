import { redirect } from "next/navigation";
import { signIn, auth } from "@/auth";
import { AuthError } from "next-auth";
import { UsernameInput } from "./UsernameInput";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session) redirect("/");
  const { error } = await searchParams;

  async function login(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    if (!email || /\s/.test(email)) redirect("/login?error=space");
    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/",
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect("/login?error=1");
      }
      throw err;
    }
  }

  return (
    <main className="login-shell">
      <section className="login-story" aria-label="Bao Bì Giấy Toàn Quốc">
        <div className="dashboard-brand">
          <span>Bao Bì Giấy<br />Toàn Quốc</span>
          <small>Không gian điều hành</small>
        </div>
        <div className="login-story-message">
          <span className="editorial-eyebrow">Dashboard nội bộ</span>
          <h1>Một ngày,<br />một nhịp rõ ràng.</h1>
          <p>Theo dõi công việc, chăm sóc khách hàng và email trong cùng một không gian.</p>
        </div>
        <span className="editorial-eyebrow login-story-footer">Bao Bì Giấy Toàn Quốc</span>
      </section>
      <section className="login-form-side" aria-labelledby="login-title">
        <div className="login-card">
          <span className="editorial-eyebrow">Chào mừng trở lại</span>
          <h2 id="login-title">Đăng nhập</h2>
          <p>Dùng tài khoản được cấp để vào bảng điều khiển công việc.</p>
          {error && <p className="login-error" role="alert">{error === "space" ? "Tên đăng nhập không được có dấu cách." : "Tên đăng nhập hoặc mật khẩu không đúng."}</p>}
          <form action={login} className="mt-7 space-y-5">
            <div>
              <label htmlFor="login-email">Tên đăng nhập</label>
              <UsernameInput />
              <p id="login-username-hint" className="mt-1 text-xs text-slate-500">Không dùng dấu cách.</p>
            </div>
            <div>
              <label htmlFor="login-password">Mật khẩu</label>
              <input id="login-password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" />
            </div>
            <button type="submit" className="login-submit">Đăng nhập</button>
          </form>
          <p className="mt-6 text-xs">Tài khoản do quản trị viên cấp. Liên hệ người quản trị nếu bạn chưa có tài khoản.</p>
        </div>
      </section>
    </main>
  );
}
