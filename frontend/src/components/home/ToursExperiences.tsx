"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, MapPin, Sparkles, Star } from "lucide-react";
import { useLocale } from "next-intl";

const tours = [
  { id: "halong", image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1000&auto=format&fit=crop&q=85", location: "Hạ Long", duration: "8", rating: 4.8, reviews: 1246, price: 1890000 },
  { id: "hoian", image: "https://images.unsplash.com/photo-1540872927746-3afded7f70c5?w=1000&auto=format&fit=crop&q=85", location: "Hội An", duration: "8", rating: 4.7, reviews: 832, price: 799000 },
  { id: "mekong", image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=1000&auto=format&fit=crop&q=85", location: "Mekong Delta", duration: "10", rating: 4.6, reviews: 643, price: 1290000 },
  { id: "phongnha", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1000&auto=format&fit=crop&q=85", location: "Phong Nha", duration: "day", rating: 4.9, reviews: 527, price: 2290000 },
] as const;

const content = {
  vi: { eyebrow: "Khám phá Việt Nam", title: "Tour & trải nghiệm nổi bật", subtitle: "Thêm những hoạt động đáng nhớ gần nơi bạn lưu trú", popular: "Phổ biến", hours: "giờ", day: "Cả ngày", reviews: "đánh giá", from: "từ", view: "Xem tour", more: "Khám phá thêm tour & trải nghiệm", names: { halong: "Du thuyền Vịnh Hạ Long", hoian: "Dạo bộ phố cổ Hội An", mekong: "Khám phá miền Tây trong ngày", phongnha: "Thám hiểm động Phong Nha" } },
  en: { eyebrow: "Discover Vietnam", title: "Tours & experiences", subtitle: "Make your stay memorable with handpicked activities nearby", popular: "Popular", hours: "hours", day: "Full day", reviews: "reviews", from: "from", view: "View tour", more: "Explore more tours & experiences", names: { halong: "Ha Long Bay Cruise", hoian: "Hoi An Ancient Town Walking Tour", mekong: "Mekong Delta Day Trip", phongnha: "Phong Nha Cave Adventure" } },
  ko: { eyebrow: "베트남 둘러보기", title: "투어 & 체험", subtitle: "숙소 근처에서 엄선한 활동으로 특별한 여행을 만들어 보세요", popular: "인기", hours: "시간", day: "하루 종일", reviews: "후기", from: "최저", view: "투어 보기", more: "더 많은 투어와 체험 보기", names: { halong: "하롱베이 크루즈", hoian: "호이안 올드타운 워킹 투어", mekong: "메콩 델타 당일 여행", phongnha: "퐁냐 동굴 어드벤처" } },
} as const;

export default function ToursExperiences() {
  const locale = useLocale() as keyof typeof content;
  const copy = content[locale] || content.en;
  const money = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : locale === "ko" ? "ko-KR" : "en-US").format;

  return <section className="relative overflow-hidden border-y border-slate-200 bg-gradient-to-b from-slate-50 to-white py-14 dark:border-slate-800 dark:from-slate-950 dark:to-slate-900">
    <div className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-900/20" />
    <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl dark:bg-cyan-900/20" />
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <p className="mb-2 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.2em] text-blue-600 dark:text-blue-400"><Sparkles className="h-4 w-4" />{copy.eyebrow}</p>
        <h2 className="text-3xl font-black tracking-tight text-[#0b1f44] dark:text-white sm:text-4xl">{copy.title}</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">{copy.subtitle}</p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tours.map((tour) => <article key={tour.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-700">
          <div className="relative h-52 overflow-hidden">
            <Image src={tour.image} alt={copy.names[tour.id]} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-110" />
            <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold text-white shadow-lg">{copy.popular}</span>
            <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/55 to-transparent" />
          </div>
          <div className="p-4">
            <h3 className="min-h-12 text-base font-extrabold leading-snug text-slate-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">{copy.names[tour.id]}</h3>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400"><span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5 text-blue-600" />{tour.duration === "day" ? copy.day : `${tour.duration} ${copy.hours}`}</span><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-blue-600" />{tour.location}</span></div>
            <div className="mt-4 flex items-end justify-between border-b border-slate-100 pb-4 dark:border-slate-800"><span className="flex items-center gap-1 text-sm font-bold text-blue-600"><Star className="h-4 w-4 fill-blue-600" />{tour.rating} <small className="font-normal text-slate-500">({money(tour.reviews)} {copy.reviews})</small></span><span className="text-right text-[10px] text-slate-500">{copy.from}<strong className="block text-base text-blue-600">{money(tour.price)} ₫</strong></span></div>
            <Link href={`/${locale}/destinations`} className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-blue-50 py-3 text-xs font-extrabold text-blue-700 transition hover:bg-blue-600 hover:text-white dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white">{copy.view}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link>
          </div>
        </article>)}
      </div>
      <div className="mt-8 text-center"><Link href={`/${locale}/destinations`} className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-5 py-2.5 text-sm font-bold text-blue-600 shadow-sm transition hover:border-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-900 dark:bg-slate-950 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white">{copy.more}<ArrowRight className="h-4 w-4" /></Link></div>
    </div>
  </section>;
}
