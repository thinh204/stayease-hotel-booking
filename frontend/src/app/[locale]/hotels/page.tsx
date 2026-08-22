import Link from "next/link";
import { getTranslations } from "next-intl/server";

interface HotelsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function HotelsPage({ params }: HotelsPageProps) {
  const { locale } = await params;
  const t = await getTranslations("Hotels");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">{t("title")}</h1>

      <p className="mt-2 text-slate-600">{t("description")}</p>

      <div className="mt-6">
        <Link
          href={`/${locale}/hotels/grand-bay-resort`}
          className="text-blue-600 hover:underline"
        >
          {t("viewHotel")}
        </Link>
      </div>
    </main>
  );
}
