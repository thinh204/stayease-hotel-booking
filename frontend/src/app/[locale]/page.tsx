import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("Home");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-slate-900">
        {t("title")}
      </h1>

      <p className="mt-3 text-slate-600">
        {t("description")}
      </p>
    </main>
  );
}
