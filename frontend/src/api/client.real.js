const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(
  /\/$/,
  ""
);

export { API_URL };

let csrfToken = null;

function readCookie(name) {
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function googleLoginUrl() {
  return `${API_URL}/oauth2/authorization/google`;
}

export async function ensureCsrf() {
  const res = await fetch(`${API_URL}/csrf`, { credentials: "include" });
  if (!res.ok) throw new Error("Could not fetch CSRF token");
  const data = await res.json();
  csrfToken = data.token || readCookie("XSRF-TOKEN");
  return csrfToken;
}

async function request(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD" && !csrfToken) {
    await ensureCsrf();
  }

  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  if (method !== "GET" && method !== "HEAD") {
    headers["X-XSRF-TOKEN"] = csrfToken || readCookie("XSRF-TOKEN") || "";
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    method,
    credentials: "include",
    headers,
  });

  if (res.status === 204) return null;

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      (typeof data === "string" ? data : `Request failed (${res.status})`);
    const error = new Error(message);
    error.status = res.status;
    error.body = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  del: (path) => request(path, { method: "DELETE" }),
};

export const profileApi = {
  me: () => api.get("/api/profile/me"),
  complete: (payload) => api.post("/api/profile/complete", payload),
};

export const categoryApi = {
  all: () => api.get("/get-all-categories"),
  byId: (id) => api.get(`/get-category-by-id/${id}`),
  byName: (name) => api.get(`/get-category-by-name/${encodeURIComponent(name)}`),
  exists: (name) => api.get(`/category-exists?name=${encodeURIComponent(name)}`),
  create: (payload) => api.post("/create-category", payload),
  update: (payload) => api.put("/update-category", payload),
  remove: (id) => api.del(`/delete-category-by-id/${id}`),
};

export const workerApi = {
  all: () => api.get("/api/worker-profiles/get-all-workers"),
  available: () => api.get("/api/worker-profiles/available"),
  verified: () => api.get("/api/worker-profiles/verified"),
  searchByCity: (city) =>
    api.get(`/api/worker-profiles/search?city=${encodeURIComponent(city)}`),
  searchByCategory: (name) =>
    api.get(
      `/api/worker-profiles/search-by-category?name=${encodeURIComponent(name)}`
    ),
  search: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") q.set(k, v);
    });
    const qs = q.toString();
    return api.get(`/api/worker-profiles/search-workers${qs ? `?${qs}` : ""}`);
  },
  byId: (id) => api.get(`/api/worker-profiles/get-worker-profile-by-id/${id}`),
  create: (payload) => api.post("/api/worker-profiles/create-worker-profile", payload),
  update: (payload) => api.put("/api/worker-profiles/update-worker-profile", payload),
  remove: (id) => api.del(`/api/worker-profiles/delete-worker-profile-by-id/${id}`),
};

export const userApi = {
  byId: (id) => api.get(`/api/users/get-user-by-id/${id}`),
  update: (payload) => api.put("/api/users/update-user", payload),
  remove: (id) => api.del(`/api/users/delete-user-by-id/${id}`),
  byRole: (role) => api.get(`/api/users/get-users-by-role?role=${role}`),
  byEmail: (email) =>
    api.get(`/api/users/get-user-by-email?email=${encodeURIComponent(email)}`),
};

export const bookingApi = {
  create: (payload) => api.post("/create-booking", payload),
  byId: (id) => api.get(`/get-booking-by-id/${id}`),
  update: (payload) => api.put("/update-booking", payload),
  byCustomer: (id) => api.get(`/get-bookings-by-customer-id/${id}`),
  byWorkerUser: (id) => api.get(`/get-bookings-by-worker-id/${id}`),
  updateStatus: (id, status) =>
    api.put(`/update-booking-status/${id}/${status}`),
  cancel: (id) => api.put(`/cancel-booking/${id}`),
};

export const reviewApi = {
  create: (payload) => api.post("/create-review", payload),
  byId: (id) => api.get(`/get-review-by-id/${id}`),
  update: (payload) => api.put("/update-review", payload),
  remove: (id) => api.del(`/delete-review-by-id/${id}`),
  byWorker: (id) => api.get(`/get-reviews-by-worker-id/${id}`),
  avg: (workerId) => api.get(`/get-worker-rating/${workerId}`),
  count: (workerId) => api.get(`/get-worker-review-count/${workerId}`),
};

export const adminApi = {
  users: () => api.get("/api/admin/users"),
  user: (id) => api.get(`/api/admin/users/${id}`),
  usersByRole: (role) => api.get(`/api/admin/users/by-role?role=${role}`),
  workers: () => api.get("/api/admin/workers"),
  verify: (id) => api.put(`/api/admin/workers/${id}/verify`),
};

export async function logout() {
  await ensureCsrf();
  await fetch(`${API_URL}/logout`, {
    method: "POST",
    credentials: "include",
    headers: { "X-XSRF-TOKEN": csrfToken || readCookie("XSRF-TOKEN") || "" },
  });
  csrfToken = null;
}
