import { getTranslations } from "next-intl/server";

interface HotelPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function HotelPage({
  params,
}: HotelPageProps) {
  const { slug } = await params;
  const t = await getTranslations("Hotels");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm text-slate-500">{t("hotelLabel")}</p>

      <h1 className="mt-2 text-3xl font-bold">
        {slug}
      </h1>

      <p className="mt-2 text-slate-600">{t("detailDescription")}</p>
    </main>
  );
}
