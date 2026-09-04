"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  X,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  BedDouble,
  User,
  Users,
  Landmark,
  Smartphone,
  WalletCards,
  Mail,
} from "lucide-react";
import { customerApi } from "@/lib/customer-api";
import { useCustomerAuth } from "@/lib/customer-auth-context";
import OtpCodeInput from "@/components/auth/OtpCodeInput";

interface BookingModalProps {
  hotel: any;
  preselectedRoomId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BookingModal({
  hotel,
  preselectedRoomId,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";
  const { isAuthenticated, user } = useCustomerAuth();

  const rooms = hotel.rooms || [];
  const [selectedRoomId, setSelectedRoomId] = useState(
    preselectedRoomId || (rooms.length > 0 ? rooms[0].id : "")
  );

  const defaultCheckIn = new Date();
  defaultCheckIn.setDate(defaultCheckIn.getDate() + 7);
  const defaultCheckOut = new Date();
  defaultCheckOut.setDate(defaultCheckOut.getDate() + 10);

  const [checkIn, setCheckIn] = useState(defaultCheckIn.toISOString().split("T")[0]);
  const [checkOut, setCheckOut] = useState(defaultCheckOut.toISOString().split("T")[0]);
  const [guests, setGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("visa");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [pendingBooking, setPendingBooking] = useState<any | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [paymentOtpChannel, setPaymentOtpChannel] = useState<"email" | "phone">("email");
  const [paymentOtpChallenge, setPaymentOtpChallenge] = useState("");
  const [paymentOtpDestination, setPaymentOtpDestination] = useState("");
  const [paymentOtp, setPaymentOtp] = useState("");
  const [paymentDevOtp, setPaymentDevOtp] = useState("");
  const [paymentReference] = useState(() => `PAY-${Date.now().toString().slice(-10)}`);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  // Price calculations
  const selectedRoom = rooms.find((r: any) => r.id === selectedRoomId);
  const pricePerNight = selectedRoom ? selectedRoom.price : hotel.pricePerNight;

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = Math.max(1, checkOutDate.getTime() - checkInDate.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const subtotal = pricePerNight * nights;
  const taxes = Math.round(subtotal * 0.1);
  const total = subtotal + taxes;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkOut <= checkIn) {
      setError("Check-out date must be after check-in date.");
      return;
    }
    if (selectedRoom && guests > selectedRoom.capacity) {
      setError(`This room allows up to ${selectedRoom.capacity} guests.`);
      return;
    }
    if (["visa", "mastercard", "bank"].includes(paymentMethod) && cardNumber.replace(/\s/g, "").length < 12) {
      setError("Please enter a valid sandbox card number.");
      return;
    }
    if (!isAuthenticated) {
      router.push(`/${currentLocale}/sign-in?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await customerApi.createBooking({
        hotelId: hotel.id,
        roomId: selectedRoomId || undefined,
        checkIn,
        checkOut,
        guests,
        specialRequests,
        paymentMethod,
        paymentReference,
      });

      if (res.success && res.data) {
        setPendingBooking(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to confirm reservation. Please check your dates.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!pendingBooking) return;
    setConfirmingPayment(true);
    setError(null);
    try {
      if (!paymentOtpChallenge) {
        const requested = await customerApi.requestPaymentOtp(pendingBooking.id, { paymentMethod, paymentReference, channel: paymentOtpChannel });
        setPaymentOtpChallenge(requested.challengeToken); setPaymentOtpDestination(requested.destination); setPaymentDevOtp(requested.devOtp || ""); setPaymentOtp("");
        return;
      }
      if (paymentOtp.length !== 6) throw new Error("Vui lòng nhập đủ mã OTP 6 số.");
      const response = await customerApi.confirmPayment(pendingBooking.id, { paymentMethod, paymentReference, challengeToken: paymentOtpChallenge, code: paymentOtp });
      if (response.success) {
        setBookingSuccess(response.data);
        setPendingBooking(null);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Payment confirmation failed.");
    } finally {
      setConfirmingPayment(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <Sparkles size={22} className="text-blue-600 dark:text-blue-400" />
            <div>
              <h2 id="booking-title" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Reserve Your Stay at {hotel.name}
              </h2>
              <span className="text-xs text-slate-500">{hotel.city}, {hotel.country}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking dialog"
            className="p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Confirmation State */}
        {pendingBooking ? (
          <div className="p-8 text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950">
              <CreditCard size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Đang chờ thanh toán</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Đơn <strong>{pendingBooking.reference}</strong> chưa được xác nhận. Hãy hoàn tất thanh toán qua {paymentMethod.toUpperCase()} trước.
              </p>
            </div>
            <div className="mx-auto max-w-md rounded-2xl border border-dashed border-blue-300 bg-blue-50 p-5 text-left text-sm dark:border-blue-800 dark:bg-blue-950/30">
              <div className="flex justify-between"><span>Số tiền</span><strong>${total.toLocaleString()}</strong></div>
              <div className="mt-2 flex justify-between"><span>Mã giao dịch</span><strong className="font-mono">{paymentReference}</strong></div>
              <div className="mt-2 flex justify-between"><span>Trạng thái</span><strong className="text-amber-600">Chưa thanh toán</strong></div>
            </div>
            <div className="mx-auto w-full max-w-md">
              <p className="mb-2 text-xs font-bold text-slate-600 dark:text-slate-300">Nhận OTP xác nhận thanh toán qua</p>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                <button type="button" onClick={() => { setPaymentOtpChannel("email"); setPaymentOtpChallenge(""); }} className={`flex h-10 items-center justify-center gap-2 rounded-lg text-xs font-bold ${paymentOtpChannel === "email" ? "bg-white text-blue-700 shadow dark:bg-slate-950" : "text-slate-500"}`}><Mail className="h-4 w-4" />Email</button>
                <button type="button" onClick={() => { setPaymentOtpChannel("phone"); setPaymentOtpChallenge(""); }} className={`flex h-10 items-center justify-center gap-2 rounded-lg text-xs font-bold ${paymentOtpChannel === "phone" ? "bg-white text-blue-700 shadow dark:bg-slate-950" : "text-slate-500"}`}><Smartphone className="h-4 w-4" />Điện thoại</button>
              </div>
              {paymentOtpChallenge && <div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-700"><p className="mb-3 text-xs text-slate-500">Mã đã gửi đến <strong>{paymentOtpDestination}</strong></p>{paymentDevOtp && <p className="mb-3 rounded-lg bg-amber-50 py-2 text-xs font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">Mã thử nghiệm local: {paymentDevOtp}</p>}<OtpCodeInput value={paymentOtp} onChange={setPaymentOtp} disabled={confirmingPayment} /></div>}
            </div>
            {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={() => setPendingBooking(null)} className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-bold dark:border-slate-700">
                Quay lại
              </button>
              <button type="button" onClick={handleConfirmPayment} disabled={confirmingPayment} className="rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white disabled:opacity-50">
                {confirmingPayment ? "Đang xử lý..." : paymentOtpChallenge ? "Xác thực OTP & hoàn tất" : "Gửi OTP xác nhận thanh toán"}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">Trong production, nút này được thay bằng callback có chữ ký từ cổng thanh toán.</p>
          </div>
        ) : bookingSuccess ? (
          <div className="p-8 text-center space-y-6 animate-in zoom-in-95">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
                Reservation Confirmed!
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Thank you, <strong>{user?.fullName}</strong>. Your luxury stay has been secured under reference code:
              </p>
              <div className="inline-block p-3 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 font-mono text-xl font-bold text-blue-600 dark:text-blue-400">
                {bookingSuccess.reference}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">Hotel:</span>
                <span className="font-bold text-slate-900 dark:text-white">{hotel.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dates:</span>
                <span>{new Date(checkIn).toLocaleDateString()} → {new Date(checkOut).toLocaleDateString()} ({nights} nights)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Price:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">${total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push(`/${currentLocale}/account`);
                }}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-500/25"
              >
                View in My Account
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm">
            {error && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 dark:bg-red-950 border border-red-500/30 text-red-700 dark:text-red-300 font-semibold">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!isAuthenticated && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 flex items-center justify-between">
                <span className="text-amber-800 dark:text-amber-300 font-semibold">
                  You are browsing as Guest. Sign in to collect StayEase VIP Rewards!
                </span>
                <button
                  type="button"
                  onClick={() => router.push(`/${currentLocale}/sign-in`)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs shadow"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Room Suite Selection */}
            {rooms.length > 0 && (
              <div className="space-y-2">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  Select Suite / Villa
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rooms.map((r: any) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRoomId(r.id)}
                      className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                        selectedRoomId === r.id
                          ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{r.type}</span>
                        <span className="text-xs text-slate-400">Max {r.capacity} Guests · Available</span>
                      </div>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm mt-2">
                        ${r.price} <span className="text-[10px] font-normal text-slate-400">/ night</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dates & Guests */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Check In Date
                </label>
                <input
                  type="date"
                  required
                  min={today}
                  value={checkIn}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    if (checkOut <= e.target.value) {
                      const nextDate = new Date(`${e.target.value}T00:00:00`);
                      nextDate.setDate(nextDate.getDate() + 1);
                      setCheckOut(nextDate.toISOString().split("T")[0]);
                    }
                    setError(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Check Out Date
                </label>
                <input
                  type="date"
                  required
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => {
                    setCheckOut(e.target.value);
                    setError(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Number of Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  {[1, 2, 3, 4, 5, 6]
                    .filter((count) => !selectedRoom || count <= selectedRoom.capacity)
                    .map((count) => (
                      <option key={count} value={count}>{count} {count === 1 ? "Guest" : "Guests"}</option>
                    ))}
                </select>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Special Requests / VIP Concierge Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. High floor, airport limousine transfer, honeymoon champagne package..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            {/* Price Summary Breakdown */}
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Phương thức thanh toán</h3>
                <p className="mt-1 text-xs text-slate-500">Chế độ sandbox — không phát sinh giao dịch tiền thật.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  { id: "visa", label: "Visa", icon: WalletCards },
                  { id: "mastercard", label: "Mastercard", icon: CreditCard },
                  { id: "bank", label: "Ngân hàng", icon: Landmark },
                  { id: "momo", label: "MoMo", icon: Smartphone },
                  { id: "zalopay", label: "ZaloPay", icon: Smartphone },
                  { id: "vnpay", label: "VNPAY", icon: Smartphone },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => { setPaymentMethod(id); setError(null); }}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-xs font-bold transition ${paymentMethod === id ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/10 dark:bg-blue-950/40 dark:text-blue-300" : "border-slate-200 dark:border-slate-800"}`}
                  >
                    <Icon size={17} /> {label}
                  </button>
                ))}
              </div>

              {["visa", "mastercard", "bank"].includes(paymentMethod) ? (
                <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                  <input required value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9 ]/g, "").slice(0, 19))} placeholder="Số thẻ sandbox" className="col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900" />
                  <input required value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Tên chủ thẻ" className="col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 uppercase dark:border-slate-800 dark:bg-slate-900" />
                  <input required value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))} placeholder="MM/YY" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900" />
                  <input required value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="CVV" type="password" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900" />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-blue-300 bg-blue-50/50 p-5 text-center dark:border-blue-800 dark:bg-blue-950/20">
                  <Smartphone className="mx-auto h-8 w-8 text-blue-600" />
                  <p className="mt-2 font-bold">Thanh toán bằng {paymentMethod === "momo" ? "MoMo" : paymentMethod === "zalopay" ? "ZaloPay" : "VNPAY"}</p>
                  <p className="mt-1 text-xs text-slate-500">Sau khi xác nhận, hệ thống sandbox sẽ mô phỏng bước chuyển sang ứng dụng và nhận kết quả callback.</p>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>${pricePerNight} × {nights} Nights</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Luxury Service & City Tax (10%)</span>
                <span>${taxes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                <span>Total Amount Due</span>
                <span className="text-blue-600 dark:text-blue-400 text-base font-black">${total.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || checkOut <= checkIn || (selectedRoom && guests > selectedRoom.capacity)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition"
              >
                {loading ? "Securing Reservation..." : "Confirm & Instant Book"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
