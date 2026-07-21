import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вход в админ-панель",
  robots: { index: false, follow: false }
};

function supabaseConfigScript() {
  return {
    __html: `window.__SUPABASE_CONFIG__ = ${JSON.stringify({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? ""
    })};`
  };
}

export default function AdminLoginPage() {
  return (
    <>
      <link rel="stylesheet" href="/admin/admin.css" />
      <main className="admin-login-page">
        <div className="login-shell">
          <section className="login-card">
            <a className="admin-brand" href="/">
              <img src="/assets/logo-dark.png" alt="" width="64" height="64" />
              <span><b>Дом на Южной</b><small>Панель владельца</small></span>
            </a>
            <div className="login-copy">
              <p className="admin-eyebrow">Защищённый вход</p>
              <h1>Добро пожаловать</h1>
              <p>Войдите, чтобы управлять заявками и календарём занятости.</p>
            </div>
            <form id="admin-login-form" className="admin-form" noValidate>
              <label>Email
                <input type="email" id="admin-email" placeholder="Ваш email" autoComplete="username" required />
              </label>
              <label>Пароль
                <input type="password" id="admin-password" autoComplete="current-password" required />
              </label>
              <p className="admin-error" id="admin-login-error" role="alert"></p>
              <button className="admin-primary" id="admin-login-submit" type="submit">Войти</button>
            </form>
            <a className="back-link" href="/">← Вернуться на сайт</a>
          </section>
        </div>
      </main>
      <script dangerouslySetInnerHTML={supabaseConfigScript()} />
      <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" defer></script>
      <script src="/supabase-browser.js" defer></script>
      <script src="/admin-login/login.js" defer></script>
    </>
  );
}
