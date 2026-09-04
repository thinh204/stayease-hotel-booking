"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, BadgeCheck, CalendarDays, Clock3, Headphones, Mail, MapPin, Quote, ShieldCheck, Star } from "lucide-react";
import { useLocale } from "next-intl";
import HomeTopContent from "@/components/home/HomeTopContent";

const destinations = [
  ["Da Nang", 320, "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=900&auto=format&fit=crop&q=85"],
  ["Hanoi", 280, "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&auto=format&fit=crop&q=85"],
  ["Ho Chi Minh City", 350, "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&auto=format&fit=crop&q=85"],
  ["Phu Quoc", 180, "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=900&auto=format&fit=crop&q=85"],
  ["Hoi An", 150, "https://images.unsplash.com/photo-1540872927746-3afded7f70c5?w=900&auto=format&fit=crop&q=85"],
  ["Nha Trang", 200, "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&auto=format&fit=crop&q=85"],
] as const;

const tours = [
  ["halong", "Ha Long", "2D1N", 4.8, 1256, 2350000, "https://images.unsplash.com/photo-1528127269322-539801943592?w=900&auto=format&fit=crop&q=85"],
  ["hoian", "Hoi An", "3H", 4.7, 842, 599000, "https://images.unsplash.com/photo-1540872927746-3afded7f70c5?w=900&auto=format&fit=crop&q=85"],
  ["mekong", "Mekong Delta", "1D", 4.9, 612, 1250000, "https://images.unsplash.com/photo-1528181304800-259b08848526?w=900&auto=format&fit=crop&q=85"],
  ["phongnha", "Phong Nha", "1D", 4.9, 612, 1890000, "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&auto=format&fit=crop&q=85"],
] as const;

const deals = [
  ["Danang Golden Bay Hotel", "Da Nang", 5, 25, 2100000, "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop&q=85"],
  ["Nha Trang Seaview Resort", "Nha Trang", 4, 20, 1600000, "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&auto=format&fit=crop&q=85"],
  ["Hoi An Ancient House Resort", "Hoi An", 4, 30, 1260000, "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&auto=format&fit=crop&q=85"],
] as const;

const reviews = [
  ["Nguyen Thi Anh", "Đặt phòng dễ dàng, mức giá tốt và hỗ trợ tuyệt vời.", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=85"],
  ["David Tran", "Smooth experience from search to stay. Highly recommend StayEase.", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=85"],
  ["Le Minh Hoang", "Trang đặt phòng tốt nhất tại Việt Nam, minh bạch và đáng tin cậy.", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=85"],
] as const;

const translations = {
  vi: {dest:"Điểm đến phổ biến",destSub:"Khám phá những nơi lưu trú hàng đầu khắp Việt Nam",allDest:"Xem tất cả điểm đến",hotels:"khách sạn",tours:"Tour & trải nghiệm nổi bật",tourSub:"Những trải nghiệm được chọn lọc cho chuyến đi đáng nhớ",allTours:"Xem tất cả tour",why:"Vì sao chọn StayEase",whySub:"Giúp trải nghiệm đặt phòng đơn giản, an toàn và đáng giá",price:"Đảm bảo giá tốt nhất",priceSub:"Luôn so khớp và có mức giá cạnh tranh",cancel:"Hủy miễn phí",cancelSub:"Linh hoạt với hầu hết đơn đặt phòng",support:"Hỗ trợ 24/7",supportSub:"Chuyên gia du lịch luôn sẵn sàng giúp bạn",verified:"Đánh giá xác thực",verifiedSub:"Đánh giá thật từ khách hàng thật",deals:"Ưu đãi đặc biệt",dealsSub:"Ưu đãi có thời hạn cho kỳ nghỉ tuyệt vời",allDeals:"Xem tất cả ưu đãi",off:"GIẢM",night:"Mỗi đêm",reviews:"Đánh giá khách hàng",reviewsSub:"Khách hàng nói gì về trải nghiệm StayEase",moreReviews:"Xem thêm đánh giá",newsletter:"Tiết kiệm hơn cùng StayEase",newsletterSub:"Nhận ưu đãi độc quyền và cảm hứng du lịch",email:"Nhập địa chỉ email",subscribe:"Đăng ký",done:"Đã đăng ký!",tourNames:{halong:"Du thuyền Vịnh Hạ Long",hoian:"Tour đi bộ Hội An",mekong:"Khám phá miền Tây",phongnha:"Thám hiểm động Phong Nha"}},
  en: {dest:"Popular Destinations",destSub:"Explore top places to stay across Vietnam",allDest:"View all destinations",hotels:"hotels",tours:"Popular Tours & Experiences",tourSub:"Handpicked experiences for unforgettable memories",allTours:"View all tours",why:"Why StayEase",whySub:"We make your booking experience simple, safe and rewarding",price:"Best Price Guarantee",priceSub:"We match and beat competitor prices",cancel:"Free Cancellation",cancelSub:"Flexible plans on most bookings",support:"24/7 Support",supportSub:"Our travel experts are always here to help",verified:"Verified Reviews",verifiedSub:"Real reviews from real guests",deals:"Special Deals",dealsSub:"Limited-time offers for amazing stays",allDeals:"View all deals",off:"OFF",night:"Per night",reviews:"Customer Reviews",reviewsSub:"What our guests say about their StayEase experience",moreReviews:"Read more reviews",newsletter:"Save more with StayEase",newsletterSub:"Subscribe for exclusive deals and travel inspiration",email:"Enter your email address",subscribe:"Subscribe",done:"Subscribed!",tourNames:{halong:"Ha Long Bay Cruise",hoian:"Hoi An Walking Tour",mekong:"Mekong Delta",phongnha:"Phong Nha Cave"}},
  ko: {dest:"인기 여행지",destSub:"베트남 최고의 숙소 지역을 둘러보세요",allDest:"모든 여행지 보기",hotels:"개 호텔",tours:"인기 투어 & 체험",tourSub:"잊지 못할 추억을 위한 엄선된 체험",allTours:"모든 투어 보기",why:"StayEase를 선택하는 이유",whySub:"간편하고 안전하며 가치 있는 예약 경험",price:"최저가 보장",priceSub:"경쟁력 있는 최적의 가격을 제공합니다",cancel:"무료 취소",cancelSub:"대부분의 예약에서 유연하게 취소",support:"24시간 지원",supportSub:"여행 전문가가 언제나 도와드립니다",verified:"검증된 후기",verifiedSub:"실제 고객이 작성한 진짜 후기",deals:"특별 할인",dealsSub:"멋진 숙박을 위한 기간 한정 혜택",allDeals:"모든 할인 보기",off:"할인",night:"1박",reviews:"고객 후기",reviewsSub:"StayEase를 이용한 고객들의 이야기",moreReviews:"후기 더 보기",newsletter:"StayEase와 더 많이 절약하세요",newsletterSub:"독점 할인과 여행 소식을 받아보세요",email:"이메일 주소 입력",subscribe:"구독",done:"구독 완료!",tourNames:{halong:"하롱베이 크루즈",hoian:"호이안 워킹 투어",mekong:"메콩 델타",phongnha:"퐁냐 동굴"}},
} as const;

export default function CompactHome() {
  const locale = useLocale() as keyof typeof translations;
  const t = translations[locale] || translations.en;
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const money = (value:number) => new Intl.NumberFormat(locale === "vi" ? "vi-VN" : locale === "ko" ? "ko-KR" : "en-US").format(value);
  const submit = (event:FormEvent) => { event.preventDefault(); setDone(true); setEmail(""); };
  const Header = ({title, sub, href, action}:{title:string;sub:string;href:string;action:string}) => <div className="mb-3 flex items-end justify-between gap-4"><div><h2 className="text-xl font-black tracking-tight text-[#0b1f44] dark:text-white sm:text-2xl">{title}</h2><p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p></div>{action && <Link href={href} className="hidden shrink-0 items-center gap-1 text-xs font-bold text-blue-600 hover:underline sm:flex">{action}<ArrowRight className="h-3.5 w-3.5" /></Link>}</div>;

  return <div className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
    <HomeTopContent />
    <div className="py-6">
    <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
      <section><Header title={t.dest} sub={t.destSub} href={`/${locale}/destinations`} action={t.allDest} /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{destinations.map(([city,count,image])=><Link href={`/${locale}/hotels?city=${encodeURIComponent(city)}`} key={city} className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"><div className="relative h-24 overflow-hidden"><Image src={image} alt={city} fill sizes="220px" className="object-cover transition duration-500 group-hover:scale-110" /></div><div className="p-2.5"><h3 className="flex items-center gap-1 text-sm font-extrabold"><MapPin className="h-3.5 w-3.5" />{city}</h3><p className="mt-1 text-[11px] font-semibold text-blue-600">◉ {count}+ {t.hotels}</p></div></Link>)}</div></section>

      <section><Header title={t.tours} sub={t.tourSub} href={`/${locale}/destinations`} action={t.allTours} /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{tours.map(([id,location,duration,rating,count,price,image])=><Link href={`/${locale}/destinations`} key={id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"><div className="relative h-28 overflow-hidden"><Image src={image} alt={t.tourNames[id]} fill sizes="350px" className="object-cover transition duration-500 group-hover:scale-110" /><span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-black text-slate-900"><Clock3 className="h-3 w-3" />{duration}</span></div><div className="p-3"><div className="flex items-start justify-between gap-2"><h3 className="text-sm font-extrabold">{t.tourNames[id]}</h3><span className="shrink-0 text-xs font-bold text-blue-600">★ {rating}</span></div><div className="mt-2 flex items-end justify-between"><span className="text-[10px] text-slate-500">{location} · ({money(count)})</span><strong className="text-sm text-[#0b1f44] dark:text-blue-400">{money(price)} VND</strong></div></div></Link>)}</div></section>
    </div>

    <section className="mt-5 bg-[#f5f8fd] py-4 dark:bg-slate-900/70"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><Header title={t.why} sub={t.whySub} href={`/${locale}/support`} action="" /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[[BadgeCheck,t.price,t.priceSub],[CalendarDays,t.cancel,t.cancelSub],[Headphones,t.support,t.supportSub],[ShieldCheck,t.verified,t.verifiedSub]].map(([Icon,title,sub]:any)=><div key={title} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950"><Icon className="h-5 w-5" /></span><div><h3 className="text-sm font-extrabold">{title}</h3><p className="mt-0.5 text-[11px] leading-snug text-slate-500">{sub}</p></div></div>)}</div></div></section>

    <div className="mx-auto max-w-7xl space-y-5 px-4 pt-5 sm:px-6 lg:px-8">
      <section><Header title={t.deals} sub={t.dealsSub} href={`/${locale}/deals`} action={t.allDeals} /><div className="grid gap-3 md:grid-cols-3">{deals.map(([name,city,stars,discount,price,image])=><Link href={`/${locale}/deals`} key={name} className="group grid grid-cols-[120px_1fr] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[160px_1fr]"><div className="relative min-h-24"><Image src={image} alt={name} fill sizes="180px" className="object-cover transition duration-500 group-hover:scale-105" /><span className="absolute left-2 top-2 rounded-md bg-blue-600 px-2 py-1 text-[10px] font-black text-white">{discount}% {t.off}</span></div><div className="p-3"><h3 className="truncate text-sm font-extrabold">{name}</h3><p className="mt-1 text-[11px] text-slate-500">{city} · {stars}★</p><div className="mt-2 flex items-end justify-between"><strong className="text-base text-blue-600">{money(price)} VND</strong><span className="text-[10px] text-slate-500">{t.night}</span></div></div></Link>)}</div></section>

      <section><Header title={t.reviews} sub={t.reviewsSub} href={`/${locale}/support`} action={t.moreReviews} /><div className="grid gap-3 md:grid-cols-3">{reviews.map(([name,quote,avatar])=><article key={name} className="relative flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"><Image src={avatar} alt={name} width={42} height={42} className="h-10 w-10 rounded-full object-cover" /><div><h3 className="text-xs font-extrabold">{name}</h3><div className="my-0.5 flex text-blue-600">{[1,2,3,4,5].map(x=><Star key={x} className="h-3 w-3 fill-current" />)}</div><p className="pr-5 text-[10px] leading-snug text-slate-500">{quote}</p></div><Quote className="absolute bottom-2 right-3 h-5 w-5 fill-blue-600 text-blue-600" /></article>)}</div></section>

      <section className="overflow-hidden rounded-xl bg-gradient-to-r from-[#0759ae] via-[#0876d9] to-[#0759ae] p-3 text-white shadow-lg"><div className="flex flex-col items-center gap-3 sm:flex-row"><div className="flex flex-1 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/40"><Mail className="h-5 w-5" /></span><div><h2 className="text-base font-extrabold">{t.newsletter}</h2><p className="text-[11px] text-blue-100">{t.newsletterSub}</p></div></div><form onSubmit={submit} className="flex w-full gap-2 sm:w-auto"><input required type="email" value={email} onChange={e=>{setEmail(e.target.value);setDone(false)}} placeholder={done?t.done:t.email} className="min-w-0 flex-1 rounded-lg bg-white px-4 py-2 text-xs text-slate-900 outline-none sm:w-64" /><button className="rounded-lg bg-[#006cf5] px-5 py-2 text-xs font-bold shadow hover:bg-blue-500">{t.subscribe}</button></form></div></section>
    </div>
    </div>
  </div>;
}
