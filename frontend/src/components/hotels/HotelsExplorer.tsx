"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Coffee,
  Dumbbell,
  ExternalLink,
  Filter,
  Headphones,
  Heart,
  List,
  Map,
  MapPin,
  ParkingCircle,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  Waves,
  Wifi,
  X,
} from "lucide-react";
import BookingModal from "@/components/hotels/BookingModal";
import { customerApi } from "@/lib/customer-api";

type Hotel = {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  city: string;
  country?: string;
  address?: string;
  pricePerNight: number;
  rating: number;
  reviewsCount?: number;
  images?: string[];
  amenities?: string[];
  reviews?: unknown[];
};

const fallbackImage =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop&q=85";
const cities = ["ALL", "Da Nang", "Hanoi", "Ho Chi Minh City", "Phu Quoc", "Seoul", "Kyoto", "Paris", "Bangkok"];
const amenityFilters = [
  { label: "Free Wi-Fi", icon: Wifi },
  { label: "Breakfast Included", icon: Coffee },
  { label: "Swimming Pool", icon: Waves },
  { label: "Fitness Center", icon: Dumbbell },
  { label: "Parking", icon: ParkingCircle },
];

const vnd = (price: number) => `${Math.round(price * 24000).toLocaleString("vi-VN")} VND`;

export default function HotelsExplorer() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const locale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "vi";
  const ui = ({
    en: {filters:"Filters",clear:"Clear all",price:"Price range",rating:"Star rating",above:"& above",amenities:"Amenities",property:"Property type",destination:"Destination",dates:"Check-in – Check-out",guests:"Guests",adult:"Adult",search:"Search",list:"List",map:"Map",properties:"properties",found:"found in",sort:"Sort by",recommended:"Recommended",low:"Price: Low to High",high:"Price: High to Low",newest:"Newest",empty:"No matching hotels found",popular:"Popular",reviews:"reviews",cancel:"Free cancellation",from:"From",night:"/ night incl. taxes",book:"Book now",open:"Open",previous:"Previous",next:"Next",forYou:"Recommended for you",forYouDesc:"Handpicked hotels based on your preferences",allRecommendations:"View all recommendations",show:"Show",excellent:"Excellent"},
    vi: {filters:"Bộ lọc",clear:"Xóa tất cả",price:"Khoảng giá",rating:"Hạng sao",above:"trở lên",amenities:"Tiện nghi",property:"Loại hình lưu trú",destination:"Điểm đến",dates:"Nhận phòng – Trả phòng",guests:"Khách",adult:"Người lớn",search:"Tìm kiếm",list:"Danh sách",map:"Bản đồ",properties:"khách sạn",found:"tại",sort:"Sắp xếp",recommended:"Đề xuất",low:"Giá: thấp đến cao",high:"Giá: cao đến thấp",newest:"Mới nhất",empty:"Không tìm thấy khách sạn phù hợp",popular:"Phổ biến",reviews:"đánh giá",cancel:"Hủy miễn phí",from:"Từ",night:"/ đêm, gồm thuế",book:"Đặt ngay",open:"Mở",previous:"Trước",next:"Sau",forYou:"Đề xuất cho bạn",forYouDesc:"Khách sạn tuyển chọn theo sở thích của bạn",allRecommendations:"Xem tất cả đề xuất",show:"Hiển thị",excellent:"Xuất sắc"},
    ko: {filters:"필터",clear:"모두 지우기",price:"가격대",rating:"호텔 등급",above:"이상",amenities:"편의시설",property:"숙소 유형",destination:"여행지",dates:"체크인 – 체크아웃",guests:"투숙객",adult:"성인",search:"검색",list:"목록",map:"지도",properties:"개 숙소",found:"검색 지역",sort:"정렬",recommended:"추천순",low:"낮은 가격순",high:"높은 가격순",newest:"최신순",empty:"조건에 맞는 호텔이 없습니다",popular:"인기",reviews:"후기",cancel:"무료 취소",from:"최저",night:"/ 세금 포함 1박",book:"예약하기",open:"열기",previous:"이전",next:"다음",forYou:"회원님을 위한 추천",forYouDesc:"선호도에 따라 엄선된 호텔",allRecommendations:"모든 추천 보기",show:"보기",excellent:"최고"}
  } as const)[locale as "en"|"vi"|"ko"];
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "ALL");
  const [maxPrice, setMaxPrice] = useState(1500);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("popular");
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [mobileMap, setMobileMap] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [bookingHotel, setBookingHotel] = useState<Hotel | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || "2026-09-12");
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "2026-09-14");
  const [guests, setGuests] = useState(Number(searchParams.get("guests") || 2));

  useEffect(() => {
    let active = true;
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const res = await customerApi.getHotels({ search, city: selectedCity, maxPrice, rating: minRating, sort });
        if (active && res.success) setHotels(res.data);
      } catch (error) {
        console.error("Failed to load hotels", error);
        if (active) setHotels([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    const timer = window.setTimeout(fetchHotels, 220);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search, selectedCity, maxPrice, minRating, sort]);

  useEffect(() => {
    if (!hotels.length) {
      setSelectedHotelId(null);
      return;
    }
    if (!hotels.some((hotel) => hotel.id === selectedHotelId)) setSelectedHotelId(hotels[0].id);
  }, [hotels, selectedHotelId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCity, maxPrice, minRating, sort]);

  useEffect(() => {
    setFavorites(JSON.parse(localStorage.getItem("stayease-favorites") || "[]"));
  }, []);

  const selectedHotel = hotels.find((hotel) => hotel.id === selectedHotelId) || hotels[0];
  const mapQuery = selectedHotel
    ? selectedHotel.address || `${selectedHotel.name}, ${selectedHotel.city}, ${selectedHotel.country || "Vietnam"}`
    : selectedCity === "ALL"
      ? "Vietnam hotels"
      : `${selectedCity} hotels`;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=14&output=embed`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
  const destinationLabel = selectedCity === "ALL" ? "Vietnam" : selectedCity;
  const reviewCount = (hotel: Hotel) => hotel.reviewsCount || hotel.reviews?.length || Math.floor((hotel.rating || 4.5) * 320);
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(hotels.length / pageSize));
  const paginatedHotels = hotels.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const recommendedHotels = hotels.slice(0, 4);

  const toggleFavorite = (hotelId: string) => {
    const next = favorites.includes(hotelId) ? favorites.filter((id) => id !== hotelId) : [...favorites, hotelId];
    setFavorites(next);
    localStorage.setItem("stayease-favorites", JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("stayease-favorites-updated", { detail: next }));
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCity("ALL");
    setMaxPrice(1500);
    setMinRating(0);
    setSort("popular");
  };

  const filterContent = useMemo(() => (
    <>
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <span className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white">
          <Filter className="h-4 w-4 text-blue-600" /> {ui.filters}
        </span>
        <button type="button" onClick={resetFilters} className="text-xs font-bold text-blue-600 hover:underline">{ui.clear}</button>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-bold text-slate-900 dark:text-white">{ui.price}</p>
        <input type="range" min={200} max={2000} step={50} value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} className="w-full accent-blue-600" />
        <div className="flex justify-between text-[11px] text-slate-500"><span>500,000 VND</span><span>{vnd(maxPrice)}</span></div>
      </div>

      <div className="space-y-2.5">
        <p className="text-sm font-bold text-slate-900 dark:text-white">{ui.rating}</p>
        {[4, 3, 2, 1].map((rate) => (
          <button key={rate} type="button" onClick={() => setMinRating(minRating === rate ? 0 : rate)} className="flex w-full items-center gap-2 text-left text-xs text-slate-600 dark:text-slate-300">
            <span className={`grid h-4 w-4 place-items-center rounded border ${minRating === rate ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`}>{minRating === rate ? "✓" : ""}</span>
            <span>{rate} {ui.above}</span>
            <span className="ml-auto flex">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className={`h-3.5 w-3.5 ${index < rate ? "fill-blue-600 text-blue-600" : "text-slate-300"}`} />)}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        <p className="text-sm font-bold text-slate-900 dark:text-white">{ui.amenities}</p>
        {amenityFilters.map(({ label, icon: Icon }, index) => (
          <label key={label} className="flex cursor-pointer items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <input type="checkbox" defaultChecked={index === 0} className="h-4 w-4 rounded accent-blue-600" />
            <Icon className="h-3.5 w-3.5" /> {label}
          </label>
        ))}
      </div>

      <div className="space-y-2.5">
        <p className="text-sm font-bold text-slate-900 dark:text-white">{ui.property}</p>
        {["Hotel", "Resort", "Apartment", "Villa", "Guest House"].map((type, index) => (
          <label key={type} className="flex cursor-pointer items-center gap-2 text-xs text-slate-600 dark:text-slate-300"><input type="checkbox" defaultChecked={index === 0} className="h-4 w-4 rounded accent-blue-600" />{type}</label>
        ))}
      </div>
    </>
  ), [maxPrice, minRating, ui]);

  return (
    <main className="min-h-screen bg-[#f6f8fc] py-5 dark:bg-slate-950">
      <div className="mx-auto max-w-[1500px] px-3 sm:px-5 lg:px-6">
        <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-2 md:grid-cols-[1.05fr_1.2fr_.9fr_auto] md:items-center">
            <div className="flex items-center gap-3 rounded-xl px-3 py-2 md:border-r md:border-slate-200 dark:md:border-slate-700">
              <MapPin className="h-6 w-6 shrink-0 text-blue-600" />
              <label className="min-w-0 flex-1"><span className="block text-[11px] font-semibold text-slate-500">{ui.destination}</span><select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)} className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none dark:text-white"><option value="ALL">Vietnam</option>{cities.slice(1).map((city) => <option key={city}>{city}</option>)}</select></label>
            </div>
            <div className="flex items-center gap-3 rounded-xl px-3 py-2 md:border-r md:border-slate-200 dark:md:border-slate-700">
              <CalendarDays className="h-6 w-6 shrink-0 text-slate-800 dark:text-white" />
              <div className="min-w-0 flex-1"><span className="block text-[11px] font-semibold text-slate-500">{ui.dates}</span><div className="flex items-center gap-1 text-xs font-bold"><input aria-label="Check-in" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="min-w-0 bg-transparent outline-none" /><span>–</span><input aria-label="Check-out" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="min-w-0 bg-transparent outline-none" /></div></div>
            </div>
            <label className="flex items-center gap-3 rounded-xl px-3 py-2"><Users className="h-6 w-6 shrink-0 text-slate-800 dark:text-white" /><span className="min-w-0 flex-1"><span className="block text-[11px] font-semibold text-slate-500">Guests</span><span className="flex items-center justify-between text-sm font-bold"><select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="bg-transparent outline-none">{[1,2,3,4,5,6].map((guest) => <option key={guest} value={guest}>{guest} Adult{guest > 1 ? "s" : ""}</option>)}</select><ChevronDown className="h-4 w-4" /></span></span></label>
            <button type="button" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0668f7] px-8 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700"><Search className="h-5 w-5" />{ui.search}</button>
          </div>
        </section>

        <div className="mb-3 flex items-center justify-between gap-3 lg:hidden">
          <button type="button" onClick={() => setMobileFilterOpen(true)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold shadow-sm dark:border-slate-800 dark:bg-slate-900"><SlidersHorizontal className="h-4 w-4" />Filters</button>
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900"><button type="button" onClick={() => setMobileMap(false)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${!mobileMap ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300" : "text-slate-500 dark:text-slate-400"}`}><List className="h-4 w-4" />{ui.list}</button><button type="button" onClick={() => setMobileMap(true)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${mobileMap ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300" : "text-slate-500 dark:text-slate-400"}`}><Map className="h-4 w-4" />{ui.map}</button></div>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[220px_minmax(0,1fr)_330px] xl:grid-cols-[240px_minmax(0,1fr)_370px]">
          <aside className="sticky top-20 hidden space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:block">{filterContent}</aside>

          <section className={mobileMap ? "hidden lg:block" : "block"}>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-700 dark:text-slate-200"><strong className="text-blue-600">{hotels.length} {ui.properties}</strong> {ui.found} {destinationLabel}</p>
              <label className="flex items-center gap-2 text-xs text-slate-500">Sort by:<select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-bold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"><option value="popular">Recommended</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option><option value="newest">Newest</option></select></label>
            </div>

            {loading ? (
              <div className="space-y-3">{[1,2,3,4].map((item) => <div key={item} className="h-44 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />)}</div>
            ) : hotels.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center dark:border-slate-700 dark:bg-slate-900"><Sparkles className="mx-auto mb-3 h-8 w-8 text-blue-500" /><p className="font-bold text-slate-900 dark:text-white">{ui.empty}</p><button type="button" onClick={resetFilters} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white">{ui.clear}</button></div>
            ) : (
              <div className="space-y-3">
                {paginatedHotels.map((hotel, index) => {
                  const image = hotel.images?.[0] || fallbackImage;
                  const isSelected = hotel.id === selectedHotel?.id;
                  return (
                    <article key={hotel.id} onClick={() => setSelectedHotelId(hotel.id)} className={`group grid cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 sm:grid-cols-[180px_minmax(0,1fr)_145px] ${isSelected ? "border-blue-500 ring-2 ring-blue-100 dark:ring-blue-950" : "border-slate-200 dark:border-slate-800"}`}>
                      <div className="relative h-44 overflow-hidden bg-slate-100 sm:h-full dark:bg-slate-800"><Image src={image} alt={hotel.name} fill sizes="(max-width: 640px) 100vw, 180px" className="object-cover transition duration-500 group-hover:scale-105" />{index === 0 && <span className="absolute left-2 top-2 rounded-md bg-blue-600 px-2 py-1 text-[10px] font-bold text-white">{ui.popular}</span>}</div>
                      <div className="min-w-0 p-4">
                        <Link href={`/${locale}/hotels/${hotel.slug || hotel.id}`} onClick={(event) => event.stopPropagation()} className="text-base font-extrabold text-slate-900 hover:text-blue-600 dark:text-white">{hotel.name}</Link>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs"><span className="flex text-blue-600">{Array.from({ length: 5 }).map((_, star) => <Star key={star} className={`h-3.5 w-3.5 ${star < Math.round(hotel.rating || 0) ? "fill-blue-600" : "text-slate-300"}`} />)}</span><strong>{hotel.rating?.toFixed(1) || "4.5"}</strong><span className="text-slate-500">({reviewCount(hotel).toLocaleString()} reviews)</span></div>
                        <p className="mt-2 flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{hotel.address || `${hotel.city}, ${hotel.country || "Vietnam"}`}</span></p>
                        <p className="mt-2 text-xs font-medium text-emerald-600">● {ui.cancel}</p>
                        <p className="mt-2 line-clamp-1 text-[11px] text-slate-600 dark:text-slate-300">{hotel.amenities?.slice(0,3).join(" · ") || "Free Wi-Fi · Breakfast Included · Swimming Pool"}</p>
                        <p className="mt-2 line-clamp-1 text-[11px] text-slate-500">{hotel.description || `Comfortable stay in the heart of ${hotel.city}.`}</p>
                      </div>
                      <div className="relative flex flex-col justify-center border-t border-slate-100 p-4 sm:border-l sm:border-t-0 dark:border-slate-800"><button type="button" aria-label="Save hotel" onClick={(event) => { event.stopPropagation(); toggleFavorite(hotel.id); }} className="absolute right-3 top-3 text-slate-400 transition hover:text-rose-500"><Heart className={`h-5 w-5 ${favorites.includes(hotel.id) ? "fill-rose-500 text-rose-500" : ""}`} /></button><span className="text-xs text-slate-500">{ui.from}</span><strong className="mt-1 text-xl text-blue-600">{vnd(hotel.pricePerNight)}</strong><span className="text-right text-xs text-slate-500">{ui.night}</span><button type="button" onClick={(event) => { event.stopPropagation(); setBookingHotel(hotel); }} className="mt-4 rounded-lg bg-[#0668f7] px-3 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700">{ui.book}</button></div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className={`${mobileMap ? "block" : "hidden"} sticky top-20 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:block`}>
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800"><div><p className="text-xs font-extrabold text-slate-900 dark:text-white">Google Map</p><p className="max-w-[220px] truncate text-[11px] text-slate-500">{mapQuery}</p></div><a href={googleMapsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] font-bold text-blue-600">Open <ExternalLink className="h-3.5 w-3.5" /></a></div>
            <iframe key={mapQuery} title={`Google Maps - ${mapQuery}`} src={mapEmbedUrl} className="h-[68vh] min-h-[520px] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            {selectedHotel && <div className="border-t border-slate-100 p-3 text-xs dark:border-slate-800"><p className="font-bold text-slate-900 dark:text-white">{selectedHotel.name}</p><p className="mt-1 flex gap-1 text-slate-500"><MapPin className="h-3.5 w-3.5 shrink-0 text-blue-600" />{selectedHotel.address || `${selectedHotel.city}, ${selectedHotel.country || "Vietnam"}`}</p></div>}
          </aside>
        </div>

        {!loading && hotels.length > 0 && (
          <nav aria-label="Hotel result pages" className="mt-5 flex items-center justify-center">
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"><ChevronLeft className="h-4 w-4" />Previous</button>
              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;
                return <button key={page} type="button" aria-current={page === currentPage ? "page" : undefined} onClick={() => setCurrentPage(page)} className={`h-8 w-8 rounded-lg text-xs font-bold transition ${page === currentPage ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}>{page}</button>;
              })}
              <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800">Next<ChevronRight className="h-4 w-4" /></button>
            </div>
          </nav>
        )}

        {!loading && recommendedHotels.length > 0 && (
          <section className="mt-8">
            <div className="mb-3 flex items-end justify-between gap-4"><div><h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Recommended for you</h2><p className="text-xs text-slate-500">Handpicked hotels based on your preferences</p></div><Link href={`/${locale}/hotels`} className="hidden items-center gap-1 text-xs font-bold text-blue-600 sm:flex">View all recommendations<ChevronRight className="h-4 w-4" /></Link></div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {recommendedHotels.map((hotel) => (
                <article key={`recommended-${hotel.id}`} className="grid min-h-32 grid-cols-[112px_minmax(0,1fr)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                  <Link href={`/${locale}/hotels/${hotel.slug || hotel.id}`} className="relative bg-slate-100 dark:bg-slate-800"><Image src={hotel.images?.[0] || fallbackImage} alt={hotel.name} fill sizes="112px" className="object-cover" /><span className="absolute left-2 top-2 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{hotel.rating?.toFixed(1)}</span></Link>
                  <div className="relative min-w-0 p-3"><button type="button" aria-label="Save hotel" onClick={() => toggleFavorite(hotel.id)} className="absolute right-2 top-2 text-slate-400 hover:text-rose-500"><Heart className={`h-4 w-4 ${favorites.includes(hotel.id) ? "fill-rose-500 text-rose-500" : ""}`} /></button><Link href={`/${locale}/hotels/${hotel.slug || hotel.id}`} className="block truncate pr-5 text-xs font-extrabold text-slate-900 hover:text-blue-600 dark:text-white">{hotel.name}</Link><p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600"><Star className="h-3 w-3 fill-emerald-600" />{hotel.rating?.toFixed(1)} · Excellent</p><p className="mt-1 truncate text-[10px] text-slate-500"><MapPin className="mr-0.5 inline h-3 w-3 text-blue-600" />{hotel.city}, {hotel.country || "Vietnam"}</p><p className="mt-2 text-sm font-extrabold text-slate-900 dark:text-white">{vnd(hotel.pricePerNight)}</p><button type="button" onClick={() => setBookingHotel(hotel)} className="mt-1 text-[11px] font-bold text-blue-600">Book Now</button></div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="mt-5 grid overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white shadow-sm dark:border-slate-800 dark:from-blue-950/30 dark:to-slate-900 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: CalendarDays, title: "Free Cancellation", detail: "Cancel for free up to 24h before check-in" },
            { icon: BadgeCheck, title: "Best Price Guarantee", detail: "We match and beat prices" },
            { icon: Headphones, title: "24/7 Support", detail: "Always here to help you" },
            { icon: ShieldCheck, title: "Secure Payment", detail: "Your payment is safe with us" },
          ].map(({ icon: Icon, title, detail }) => (
            <div key={title} className="flex items-center gap-3 border-b border-blue-100 p-4 last:border-b-0 sm:[&:nth-child(odd)]:border-r xl:border-b-0 xl:border-r xl:last:border-r-0 dark:border-slate-800"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-blue-600 shadow-sm dark:bg-slate-800"><Icon className="h-5 w-5" /></span><div><h3 className="text-xs font-extrabold text-slate-900 dark:text-white">{title}</h3><p className="mt-0.5 text-[10px] text-slate-500">{detail}</p></div></div>
          ))}
        </section>
      </div>

      {mobileFilterOpen && <div className="fixed inset-0 z-50 flex items-end bg-black/60 p-0 sm:items-center sm:justify-center sm:p-4"><div className="max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 dark:bg-slate-900 sm:max-w-md sm:rounded-3xl"><div className="mb-5 flex items-center justify-between"><h2 className="font-extrabold">Filters</h2><button type="button" onClick={() => setMobileFilterOpen(false)}><X className="h-5 w-5" /></button></div><div className="space-y-5">{filterContent}</div><button type="button" onClick={() => setMobileFilterOpen(false)} className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white">Show {hotels.length} properties</button></div></div>}
      {bookingHotel && <BookingModal hotel={bookingHotel} onClose={() => setBookingHotel(null)} />}
    </main>
  );
}
