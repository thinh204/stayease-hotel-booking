"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  Star,
  Users,
  DollarSign,
  Building2,
  BedDouble,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
  X,
  Check,
  AlertTriangle,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { adminHotelsApi, adminUsersApi } from "@/lib/admin-api";
import { useAdminAuth } from "@/lib/admin-auth-context";

export default function HotelManagement() {
  const t = useTranslations("Admin.hotels");
  const tc = useTranslations("Admin.common");
  const { isAdmin } = useAdminAuth();

  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editHotel, setEditHotel] = useState<any | null>(null);
  const [deleteModalHotel, setDeleteModalHotel] = useState<any | null>(null);
  const [roomsModalHotel, setRoomsModalHotel] = useState<any | null>(null);
  const [detailsHotel, setDetailsHotel] = useState<any | null>(null);
  const [assignModalHotel, setAssignModalHotel] = useState<any | null>(null);
  const [managers, setManagers] = useState<any[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState("");

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [hotelForm, setHotelForm] = useState({
    name: "",
    description: "",
    city: "",
    country: "",
    address: "",
    pricePerNight: 350,
    images: "",
    amenities: "Infinity Pool, Ocean View, Michelin Dining, Luxury Spa",
    managerId: "",
  });

  const [roomForm, setRoomForm] = useState({
    type: "Deluxe Ocean Suite",
    price: 450,
    capacity: 2,
    totalRooms: 10,
    amenities: "King Bed, Balcony, Rain Shower, Free Breakfast",
  });

  useEffect(() => {
    fetchHotels();
    fetchManagers();
  }, [search, cityFilter, statusFilter]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await adminHotelsApi.getAll({
        search,
        city: cityFilter !== "ALL" ? cityFilter : undefined,
        isActive: statusFilter !== "ALL" ? statusFilter : undefined,
      });
      if (res.success) {
        setHotels(res.data);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to load hotels" });
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await adminUsersApi.getAll({ limit: 50, role: "MANAGER" });
      if (res.success) {
        setManagers(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch managers", err);
    }
  };

  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const imgArray = hotelForm.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const amenArray = hotelForm.amenities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await adminHotelsApi.create({
        name: hotelForm.name,
        description: hotelForm.description,
        city: hotelForm.city,
        country: hotelForm.country,
        address: hotelForm.address,
        pricePerNight: Number(hotelForm.pricePerNight),
        images: imgArray.length > 0 ? imgArray : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80"],
        amenities: amenArray,
        managerId: hotelForm.managerId || undefined,
      });

      if (res.success) {
        setMessage({ type: "success", text: "Luxury property created successfully!" });
        setCreateModalOpen(false);
        setHotelForm({
          name: "",
          description: "",
          city: "",
          country: "",
          address: "",
          pricePerNight: 350,
          images: "",
          amenities: "Infinity Pool, Ocean View, Michelin Dining, Luxury Spa",
          managerId: "",
        });
        fetchHotels();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to create hotel" });
    }
  };

  const handleUpdateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editHotel) return;
    try {
      const res = await adminHotelsApi.update(editHotel.id, {
        name: editHotel.name,
        description: editHotel.description,
        city: editHotel.city,
        country: editHotel.country,
        address: editHotel.address,
        pricePerNight: Number(editHotel.pricePerNight),
        isActive: editHotel.isActive,
      });

      if (res.success) {
        setMessage({ type: "success", text: "Hotel details updated successfully!" });
        setEditHotel(null);
        fetchHotels();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update hotel" });
    }
  };

  const handleDeleteHotel = async () => {
    if (!deleteModalHotel) return;
    try {
      const res = await adminHotelsApi.delete(deleteModalHotel.id);
      if (res.success) {
        setMessage({ type: "success", text: `Hotel property "${deleteModalHotel.name}" removed.` });
        setDeleteModalHotel(null);
        fetchHotels();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete hotel" });
    }
  };

  const handleToggleStatus = async (hotel: any) => {
    try {
      const res = await adminHotelsApi.toggleStatus(hotel.id, !hotel.isActive);
      if (res.success) {
        setMessage({
          type: "success",
          text: `Property is now ${!hotel.isActive ? "Active" : "Inactive"}.`,
        });
        fetchHotels();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update status" });
    }
  };

  const handleAssignManager = async () => {
    if (!assignModalHotel) return;
    try {
      const res = await adminHotelsApi.assignManager(
        assignModalHotel.id,
        selectedManagerId || null
      );
      if (res.success) {
        setMessage({ type: "success", text: "Manager assignment updated." });
        setAssignModalHotel(null);
        fetchHotels();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to assign manager" });
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomsModalHotel) return;
    try {
      const amenArray = roomForm.amenities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await adminHotelsApi.addRoom(roomsModalHotel.id, {
        type: roomForm.type,
        price: Number(roomForm.price),
        capacity: Number(roomForm.capacity),
        totalRooms: Number(roomForm.totalRooms),
        amenities: amenArray,
      });

      if (res.success) {
        setMessage({ type: "success", text: `Room type "${roomForm.type}" added successfully!` });
        // Refresh details for rooms modal
        const updatedHotel = await adminHotelsApi.getById(roomsModalHotel.id);
        if (updatedHotel.success) {
          setRoomsModalHotel(updatedHotel.data);
        }
        fetchHotels();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to add room type" });
    }
  };

  const openRoomsModal = async (hotel: any) => {
    try {
      const res = await adminHotelsApi.getById(hotel.id);
      if (res.success) {
        setRoomsModalHotel(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openDetailsModal = async (hotel: any) => {
    try {
      const res = await adminHotelsApi.getById(hotel.id);
      if (res.success) {
        setDetailsHotel(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Extract unique cities
  const uniqueCities = Array.from(new Set(hotels.map((h) => h.city))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {message && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl text-sm font-semibold shadow-md animate-in fade-in ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30"
              : "bg-red-50 dark:bg-red-950/80 text-red-800 dark:text-red-200 border border-red-500/30"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? <Check size={18} /> : <AlertTriangle size={18} />}
            <span>{message.text}</span>
          </div>
          <button type="button" onClick={() => setMessage(null)} className="p-1 hover:opacity-75">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Grid / Table switch */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400 font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
              title={t("viewGrid")}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400 font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
              title={t("viewTable")}
            >
              <List size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-500/25"
          >
            <Plus size={16} />
            <span>{t("addHotel")}</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="ALL">{t("allCities")}</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="ALL">All Operational Statuses</option>
            <option value="true">{t("active")}</option>
            <option value="false">{t("inactive")}</option>
          </select>
        </div>
      </div>

      {/* Main Hotel Display */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold">{tc("loading")}</span>
        </div>
      ) : hotels.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          No luxury properties found matching criteria.
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => {
            const firstImage = hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80";
            return (
              <div
                key={hotel.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Image Cover */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img
                    src={firstImage}
                    alt={hotel.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-400 text-xs font-bold shadow-md">
                    <Star size={13} className="fill-amber-400" />
                    <span>{hotel.rating || 4.9}</span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md ${
                        hotel.isActive
                          ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30"
                          : "bg-red-950/80 text-red-300 border border-red-500/30"
                      }`}
                    >
                      {hotel.isActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {hotel.isActive ? t("active") : t("inactive")}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-500 transition-colors">
                      {hotel.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <MapPin size={13} className="text-blue-500 flex-shrink-0" />
                      <span>{hotel.city}, {hotel.country}</span>
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                      {hotel.description}
                    </p>
                  </div>

                  {/* Operational Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{t("startingPrice")}</span>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400">${hotel.pricePerNight}/night</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{t("occupancy")}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{hotel.averageOccupancy}%</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Manager:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {hotel.manager?.name || "Super Admin"}
                      </span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => openDetailsModal(hotel)}
                      className="flex-1 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Eye size={14} />
                      <span>{t("view")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openRoomsModal(hotel)}
                      className="flex-1 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-600 dark:text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <BedDouble size={14} />
                      <span>{t("manageRooms")}</span>
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditHotel(hotel)}
                          title={t("edit")}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteModalHotel(hotel)}
                          title={t("delete")}
                          className="p-2 rounded-xl border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">{t("hotelName")}</th>
                <th className="py-3.5 px-4">{t("location")}</th>
                <th className="py-3.5 px-4">{t("startingPrice")}</th>
                <th className="py-3.5 px-4">{t("rating")}</th>
                <th className="py-3.5 px-4">{t("occupancy")}</th>
                <th className="py-3.5 px-4">{t("manager")}</th>
                <th className="py-3.5 px-4">{t("status")}</th>
                <th className="py-3.5 px-4 text-right">{tc("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {hotels.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {h.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {h.city}, {h.country}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-blue-600 dark:text-blue-400">
                    ${h.pricePerNight}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-amber-500">
                    ★ {h.rating}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                    {h.averageOccupancy}%
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {h.manager?.name || "Admin"}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(h)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        h.isActive
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                          : "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {h.isActive ? t("active") : t("inactive")}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openDetailsModal(h)}
                        title={t("view")}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openRoomsModal(h)}
                        title={t("manageRooms")}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600"
                      >
                        <BedDouble size={15} />
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditHotel(h)}
                            title={t("edit")}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteModalHotel(h)}
                            title={t("delete")}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE HOTEL MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 size={18} className="text-blue-500" />
                <span>{t("createHotelTitle")}</span>
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateHotel} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("hotelName")} *
                </label>
                <input
                  type="text"
                  required
                  value={hotelForm.name}
                  onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                  placeholder="e.g. Grand Azure Riviera Resort"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("description")}
                </label>
                <textarea
                  rows={2}
                  value={hotelForm.description}
                  onChange={(e) => setHotelForm({ ...hotelForm, description: e.target.value })}
                  placeholder="Detailed luxury narrative..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("city")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={hotelForm.city}
                    onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })}
                    placeholder="e.g. Da Nang"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("country")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={hotelForm.country}
                    onChange={(e) => setHotelForm({ ...hotelForm, country: e.target.value })}
                    placeholder="e.g. Vietnam"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("address")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={hotelForm.address}
                    onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
                    placeholder="123 Luxury Coastal Blvd"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("pricePerNight")} *
                  </label>
                  <input
                    type="number"
                    required
                    min={50}
                    value={hotelForm.pricePerNight}
                    onChange={(e) => setHotelForm({ ...hotelForm, pricePerNight: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("imageUrls")}
                </label>
                <input
                  type="text"
                  value={hotelForm.images}
                  onChange={(e) => setHotelForm({ ...hotelForm, images: e.target.value })}
                  placeholder="https://images.unsplash.com/..., https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("amenities")}
                </label>
                <input
                  type="text"
                  value={hotelForm.amenities}
                  onChange={(e) => setHotelForm({ ...hotelForm, amenities: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("selectManager")}
                </label>
                <select
                  value={hotelForm.managerId}
                  onChange={(e) => setHotelForm({ ...hotelForm, managerId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="">{t("unassigned")}</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {tc("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-500/20"
                >
                  {t("saveHotel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT HOTEL MODAL */}
      {editHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t("editHotelTitle")}: {editHotel.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditHotel(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateHotel} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("hotelName")}
                </label>
                <input
                  type="text"
                  required
                  value={editHotel.name}
                  onChange={(e) => setEditHotel({ ...editHotel, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("city")}
                  </label>
                  <input
                    type="text"
                    required
                    value={editHotel.city}
                    onChange={(e) => setEditHotel({ ...editHotel, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("pricePerNight")} ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={editHotel.pricePerNight}
                    onChange={(e) => setEditHotel({ ...editHotel, pricePerNight: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("address")}
                </label>
                <input
                  type="text"
                  required
                  value={editHotel.address}
                  onChange={(e) => setEditHotel({ ...editHotel, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditHotel(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {tc("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-500/20"
                >
                  {tc("save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE ROOMS MODAL */}
      {roomsModalHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t("roomsTitle")}: {roomsModalHotel.name}
                </h3>
                <p className="text-xs text-slate-500">Configure suites, pricing, and room inventory</p>
              </div>
              <button
                type="button"
                onClick={() => setRoomsModalHotel(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Existing Rooms */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Suites</h4>
              {roomsModalHotel.rooms && roomsModalHotel.rooms.length > 0 ? (
                <div className="space-y-2">
                  {roomsModalHotel.rooms.map((room: any) => (
                    <div
                      key={room.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{room.type}</p>
                        <p className="text-xs text-slate-500">
                          Capacity: {room.capacity} guests · Inventory: {room.totalRooms} rooms ({room.availableRooms} available)
                        </p>
                      </div>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                        ${room.price}/night
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No room types configured yet.</p>
              )}
            </div>

            {/* Add New Room Form */}
            <form onSubmit={handleAddRoom} className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {t("addRoom")}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("roomType")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={roomForm.type}
                    onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("roomPrice")} ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min={50}
                    value={roomForm.price}
                    onChange={(e) => setRoomForm({ ...roomForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("capacity")}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("totalInventory")}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={roomForm.totalRooms}
                    onChange={(e) => setRoomForm({ ...roomForm, totalRooms: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md shadow-purple-500/20"
                >
                  {t("saveRoom")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HOTEL DETAILS MODAL */}
      {detailsHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-400" />
                  <span>{detailsHotel.name}</span>
                </h3>
                <p className="text-xs text-slate-500">{detailsHotel.address}, {detailsHotel.city}, {detailsHotel.country}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailsHotel(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Performance KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Occupancy</span>
                <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{detailsHotel.stats?.occupancyRate || 75}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Monthly Revenue</span>
                <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">${(detailsHotel.stats?.monthlyRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Rooms</span>
                <span className="text-lg font-extrabold text-purple-600 dark:text-purple-400">{detailsHotel.stats?.totalRooms || 10}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Bookings</span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">{detailsHotel.stats?.totalBookings || 0}</span>
              </div>
            </div>

            {/* Description */}
            <div className="text-xs text-slate-700 dark:text-slate-300">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] mb-1">About Property</h4>
              <p>{detailsHotel.description}</p>
            </div>

            {/* Amenities Tags */}
            {detailsHotel.amenities && detailsHotel.amenities.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {detailsHotel.amenities.map((am: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 text-xs font-semibold">
                      {am}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle size={24} />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Luxury Property</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to delete property <strong>{deleteModalHotel.name}</strong>? All associated room configurations will also be removed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteModalHotel(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {tc("cancel")}
              </button>
              <button
                type="button"
                onClick={handleDeleteHotel}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-md shadow-red-500/20"
              >
                {tc("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
