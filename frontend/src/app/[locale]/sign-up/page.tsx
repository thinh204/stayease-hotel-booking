import { getTranslations } from "next-intl/server";

export default async function SignUpPage() {
  const t = await getTranslations("Auth");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">{t("signUpTitle")}</h1>
      <p className="mt-2 text-slate-600">{t("signUpDescription")}</p>
    </main>
  );
}
