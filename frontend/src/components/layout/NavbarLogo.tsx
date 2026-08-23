"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavbarLogoProps = {
  onClick?: () => void;
};

export default function NavbarLogo({ onClick }: NavbarLogoProps) {
  const pathname = usePathname();
  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";

  return (
    <Link
      href={`/${currentLocale}`}
      className="group flex shrink-0 items-center gap-2.5 select-none"
      onClick={onClick}
    >
      {/* Blue Home / StayEase Icon */}
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="currentColor" fillOpacity="0.2" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none font-heading">
          Stay<span className="text-blue-600 dark:text-blue-400">Ease</span>
        </span>
        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 mt-0.5 tracking-wide">
          Your stay, your way
        </span>
      </div>
    </Link>
  );
}
