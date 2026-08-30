const API_BASE = process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL || "http://localhost:5000/api/admin";

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("stayease_admin_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }
  return data as T;
}

// 1. Auth API
export const adminAuthApi = {
  async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return handleResponse<{ success: boolean; token: string; user: any; message?: string }>(res);
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; user: any }>(res);
  },

  async updateProfile(data: { fullName?: string; phone?: string; bio?: string; avatar?: string }) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; user: any; message: string }>(res);
  },

  async changePassword(data: { oldPassword: string; newPassword: string }) {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async logout() {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },
};

// 2. User Management API
export const adminUsersApi = {
  async getAll(params?: { page?: number; limit?: number; search?: string; role?: string; isActive?: string; sort?: string; order?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.search) query.set("search", params.search);
    if (params?.role && params.role !== "ALL") query.set("role", params.role);
    if (params?.isActive !== undefined && params.isActive !== "ALL") query.set("isActive", params.isActive);
    if (params?.sort) query.set("sort", params.sort);
    if (params?.order) query.set("order", params.order);

    const res = await fetch(`${API_BASE}/users?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; data: any[]; pagination: { total: number; page: number; limit: number; pages: number } }>(res);
  },

  async getById(id: string) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; data: any }>(res);
  },

  async create(data: { email: string; password: string; fullName: string; phone?: string; role?: string; bio?: string }) {
    const res = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async update(id: string, data: { fullName?: string; phone?: string; role?: string; isActive?: boolean; bio?: string }) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async delete(id: string) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async changeRole(id: string, role: string) {
    const res = await fetch(`${API_BASE}/users/${id}/role`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async lockUnlock(id: string, isLocked: boolean, reason?: string) {
    const res = await fetch(`${API_BASE}/users/${id}/lock`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ isLocked, reason }),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async resetPassword(id: string, newPassword: string) {
    const res = await fetch(`${API_BASE}/users/${id}/reset-password`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ newPassword }),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async getActivity(id: string) {
    const res = await fetch(`${API_BASE}/users/${id}/activity`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; loginHistory: any[]; bookingHistory: any[]; auditLogs: any[] }>(res);
  },
};

// 3. Hotel Management API
export const adminHotelsApi = {
  async getAll(params?: { page?: number; limit?: number; search?: string; city?: string; isActive?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.search) query.set("search", params.search);
    if (params?.city) query.set("city", params.city);
    if (params?.isActive !== undefined && params.isActive !== "ALL") query.set("isActive", params.isActive);

    const res = await fetch(`${API_BASE}/hotels?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; data: any[]; pagination: { total: number; page: number; limit: number; pages: number } }>(res);
  },

  async getById(id: string) {
    const res = await fetch(`${API_BASE}/hotels/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; data: any }>(res);
  },

  async create(data: { name: string; description: string; city: string; country: string; address: string; pricePerNight: number; images?: string[]; amenities?: string[]; managerId?: string }) {
    const res = await fetch(`${API_BASE}/hotels`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async update(id: string, data: any) {
    const res = await fetch(`${API_BASE}/hotels/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async delete(id: string) {
    const res = await fetch(`${API_BASE}/hotels/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async toggleStatus(id: string, isActive: boolean, reason?: string) {
    const res = await fetch(`${API_BASE}/hotels/${id}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ isActive, reason }),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async assignManager(id: string, managerId: string | null) {
    const res = await fetch(`${API_BASE}/hotels/${id}/assign-manager`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ managerId }),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async addRoom(hotelId: string, data: { type: string; price: number; capacity?: number; totalRooms?: number; amenities?: string[]; images?: string[] }) {
    const res = await fetch(`${API_BASE}/hotels/${hotelId}/rooms`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },
};

// 4. Booking Management API
export const adminBookingsApi = {
  async getAll(params?: { page?: number; limit?: number; status?: string; search?: string; hotelId?: string; from?: string; to?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.status && params.status !== "ALL") query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    if (params?.hotelId) query.set("hotelId", params.hotelId);
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);

    const res = await fetch(`${API_BASE}/bookings?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; data: any[]; statistics: any; pagination: any }>(res);
  },

  async getById(id: string) {
    const res = await fetch(`${API_BASE}/bookings/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; data: any }>(res);
  },

  async updateStatus(id: string, status: string, reason?: string) {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, reason }),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async refund(id: string, data: { amount?: number; reason?: string; refundType?: string }) {
    const res = await fetch(`${API_BASE}/bookings/${id}/refund`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async notify(id: string, data: { type: string; subject: string; message: string }) {
    const res = await fetch(`${API_BASE}/bookings/${id}/notify`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },
};

// 5. Analytics API
export const adminAnalyticsApi = {
  async getDashboard() {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; overview: any; thisMonth: any; comparison: any; topHotels: any[]; topCities: any[] }>(res);
  },

  async getRevenue() {
    const res = await fetch(`${API_BASE}/analytics/revenue`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; data: any[]; summary: any }>(res);
  },

  async getUsers() {
    const res = await fetch(`${API_BASE}/analytics/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; data: any[]; summary: any }>(res);
  },

  async getOccupancy() {
    const res = await fetch(`${API_BASE}/analytics/occupancy`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; data: any[]; summary: any }>(res);
  },

  getExportUrl(type: "bookings" | "users" | "audit") {
    return `${API_BASE}/analytics/export?type=${type}`;
  },
};

// 6. Settings API
export const adminSettingsApi = {
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; data: any }>(res);
  },

  async updateSettings(data: any) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async getEmailSettings() {
    const res = await fetch(`${API_BASE}/settings/email`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; data: any }>(res);
  },

  async updateEmailSettings(data: any) {
    const res = await fetch(`${API_BASE}/settings/email`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async testEmail(data: { to: string; subject: string; body: string }) {
    const res = await fetch(`${API_BASE}/settings/test-email`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },
};

// 7. Audit Logs API
export const adminAuditApi = {
  async getLogs(params?: { page?: number; limit?: number; action?: string; entity?: string; from?: string; to?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.action && params.action !== "ALL") query.set("action", params.action);
    if (params?.entity && params.entity !== "ALL") query.set("entity", params.entity);
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);

    const res = await fetch(`${API_BASE}/audit/logs?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; data: any[]; pagination: any }>(res);
  },

  getExportUrl() {
    return `${API_BASE}/audit/export`;
  },
};
