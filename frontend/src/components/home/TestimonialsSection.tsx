"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { Mail, Star } from "lucide-react";
import { useTranslations } from "next-intl";

const reviews = [
  { name: "Sarah Johnson", country: "Singapore", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=85", quote: "StayEase made booking our hotel in Da Nang so easy. Great prices, amazing support, and the hotel was exactly as described. Highly recommend!" },
  { name: "Mark Tran", country: "Australia", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=85", quote: "Found a fantastic hotel in Hanoi through StayEase with free cancellation. The process was smooth and the service was excellent. Will definitely use again!" },
  { name: "Priya Sharma", country: "India", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=85", quote: "Loved our stay in Phu Quoc, booked through StayEase. Verified reviews helped us choose the perfect resort. Excellent experience overall!" },
];

export default function TestimonialsSection() {
  const t = useTranslations("Public");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <section className="bg-white pb-1 pt-4 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-[#0b1f44] dark:text-white">{t("guestsSay")}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.name} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Image src={review.avatar} alt={review.name} width={42} height={42} className="h-10 w-10 rounded-full object-cover" />
                  <div><h3 className="text-sm font-bold text-slate-900 dark:text-white">{review.name}</h3><p className="text-xs text-slate-500">{review.country}</p></div>
                </div>
                <div className="flex gap-0.5 text-blue-600" aria-label="5 out of 5 stars">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={15} className="fill-blue-600" />)}</div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">{review.quote}</p>
            </article>
          ))}
        </div>

        <div className="my-5 flex flex-col items-center gap-4 rounded-xl bg-gradient-to-r from-blue-50 to-sky-100 px-5 py-4 dark:from-blue-950/60 dark:to-slate-900 lg:flex-row">
          <div className="flex flex-1 items-center gap-4">
            <Mail className="h-9 w-9 flex-none text-blue-600" />
            <div><h3 className="text-xl font-extrabold text-[#0b1f44] dark:text-white">{t("newsletterTitle")}</h3><p className="text-xs text-slate-600 dark:text-slate-400">{t("newsletterDescription")}</p></div>
          </div>
          <form onSubmit={subscribe} className="flex w-full gap-2 lg:w-auto">
            <label className="sr-only" htmlFor="newsletter-email">{t("email")}</label>
            <input id="newsletter-email" type="email" required value={email} onChange={(event) => { setEmail(event.target.value); setSubscribed(false); }} placeholder={subscribed ? t("subscribed") : t("emailPlaceholder")} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 lg:w-64 dark:border-slate-700 dark:bg-slate-950" />
            <button className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700">{t("subscribe")}</button>
          </form>
        </div>
      </div>
    </section>
  );
}
