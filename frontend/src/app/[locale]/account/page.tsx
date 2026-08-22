import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function AccountPage() {
  const t = await getTranslations("Account");

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            StayEase
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-slate-600">{t("description")}</p>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900">
            {t("welcomeTitle")}
          </h2>
          <p className="mt-2 text-slate-600">{t("welcomeDescription")}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link
              href="/login"
              className="rounded-lg border border-blue-600 px-4 py-3 text-center text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              {t("login")}
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {t("register")}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}