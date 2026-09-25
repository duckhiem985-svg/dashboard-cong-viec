import { redirect } from "next/navigation";
import { signIn, auth } from "@/auth";
import { AuthError } from "next-auth";

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
        <div>
          <span className="editorial-eyebrow">Dashboard nội bộ</span>
          <h1>Một ngày,<br />một nhịp rõ ràng.</h1>
          <p>Theo dõi công việc, chăm sóc khách hàng và email trong cùng một không gian.</p>
        </div>
        <span className="editorial-eyebrow">Bao Bì Giấy Toàn Quốc</span>
      </section>
      <section className="login-form-side" aria-labelledby="login-title">
        <div className="login-card">
          <span className="editorial-eyebrow">Chào mừng trở lại</span>
          <h2 id="login-title">Đăng nhập</h2>
          <p>Dùng tài khoản được cấp để vào bảng điều khiển công việc.</p>
          {error && <p className="login-error" role="alert">Email hoặc mật khẩu không đúng.</p>}
          <form action={login} className="mt-7 space-y-5">
            <div>
              <label htmlFor="login-email">Tên đăng nhập</label>
              <input id="login-email" name="email" type="text" required autoComplete="username" autoCapitalize="none" placeholder="Tên đăng nhập" />
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
