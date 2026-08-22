import { getTranslations } from "next-intl/server";

export default async function DealsPage() {
  const t = await getTranslations("Deals");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">{t("title")}</h1>

      <p className="mt-2 text-slate-600">{t("description")}</p>
    </main>
  );
}
