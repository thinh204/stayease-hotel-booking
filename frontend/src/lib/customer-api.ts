export const CUSTOMER_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/public";

function getCustomerAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("stayease_customer_token") : null;
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

export const customerApi = {
  // Hotels
  async getHotels(params?: { search?: string; city?: string; minPrice?: number; maxPrice?: number; rating?: number; sort?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.city && params.city !== "ALL") query.set("city", params.city);
    if (params?.minPrice) query.set("minPrice", params.minPrice.toString());
    if (params?.maxPrice) query.set("maxPrice", params.maxPrice.toString());
    if (params?.rating) query.set("rating", params.rating.toString());
    if (params?.sort) query.set("sort", params.sort);

    const res = await fetch(`${CUSTOMER_API_BASE}/hotels?${query.toString()}`);
    return handleResponse<{ success: boolean; data: any[] }>(res);
  },

  async getHotelBySlug(slugOrId: string) {
    const res = await fetch(`${CUSTOMER_API_BASE}/hotels/${slugOrId}`);
    return handleResponse<{ success: boolean; data: any }>(res);
  },

  async createReview(hotelId: string, data: { rating: number; comment: string }) {
    const res = await fetch(`${CUSTOMER_API_BASE}/hotels/${hotelId}/reviews`, {
      method: "POST",
      headers: getCustomerAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; data: any; message: string }>(res);
  },

  // Auth
  async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${CUSTOMER_API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return handleResponse<{ success: boolean; token: string; user: any; message: string }>(res);
  },

  async register(data: { fullName: string; email: string; password: string; phone?: string }) {
    const res = await fetch(`${CUSTOMER_API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; token: string; user: any; message: string }>(res);
  },

  async getMe() {
    const res = await fetch(`${CUSTOMER_API_BASE}/auth/me`, {
      headers: getCustomerAuthHeaders(),
    });
    return handleResponse<{ success: boolean; user: any }>(res);
  },

  async updateProfile(data: { fullName?: string; phone?: string; bio?: string; avatar?: string }) {
    const res = await fetch(`${CUSTOMER_API_BASE}/auth/profile`, {
      method: "PUT",
      headers: getCustomerAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; user: any; message: string }>(res);
  },

  // Bookings
  async createBooking(data: { hotelId: string; roomId?: string; checkIn: string; checkOut: string; guests?: number; specialRequests?: string; paymentMethod?: string; paymentReference?: string }) {
    const res = await fetch(`${CUSTOMER_API_BASE}/bookings`, {
      method: "POST",
      headers: getCustomerAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async confirmPayment(bookingId: string, data: { paymentMethod: string; paymentReference: string }) {
    const res = await fetch(`${CUSTOMER_API_BASE}/bookings/${bookingId}/payments/confirm`, {
      method: "POST",
      headers: getCustomerAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async getMyBookings() {
    const res = await fetch(`${CUSTOMER_API_BASE}/user/bookings`, {
      headers: getCustomerAuthHeaders(),
    });
    return handleResponse<{ success: boolean; data: any[] }>(res);
  },

  async cancelBooking(bookingId: string) {
    const res = await fetch(`${CUSTOMER_API_BASE}/user/bookings/${bookingId}/cancel`, {
      method: "POST",
      headers: getCustomerAuthHeaders(),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },
};
