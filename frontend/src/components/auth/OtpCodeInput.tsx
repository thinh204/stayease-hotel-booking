"use client";

import { ClipboardEvent, KeyboardEvent, useRef } from "react";

export default function OtpCodeInput({ value, onChange, disabled = false }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] || "");
  const setDigit = (index: number, digit: string) => {
    const next = [...digits]; next[index] = digit.replace(/\D/g, "").slice(-1); onChange(next.join(""));
    if (next[index] && index < 5) refs.current[index + 1]?.focus();
  };
  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) refs.current[index - 1]?.focus();
  };
  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) { event.preventDefault(); onChange(pasted); refs.current[Math.min(pasted.length, 5)]?.focus(); }
  };
  return <div className="flex justify-center gap-2 sm:gap-3">{digits.map((digit, index) => <input key={index} ref={(node) => { refs.current[index] = node; }} value={digit} disabled={disabled} inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} maxLength={1} aria-label={`OTP digit ${index + 1}`} onChange={(event) => setDigit(index, event.target.value)} onKeyDown={(event) => onKeyDown(index, event)} onPaste={onPaste} className="h-14 w-11 rounded-xl border border-slate-300 bg-white text-center text-2xl font-extrabold text-[#0b2a55] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60 sm:h-16 sm:w-14 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950" />)}</div>;
}
