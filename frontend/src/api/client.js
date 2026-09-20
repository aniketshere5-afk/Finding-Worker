const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const DEMO_MODE = String(import.meta.env.VITE_DEMO_MODE ?? "true").toLowerCase() === "true";

export { API_URL, DEMO_MODE };

let csrfToken = null;

const categories = [
  { id: 1, name: "Electrician" }, { id: 2, name: "Plumber" },
  { id: 3, name: "Carpenter" }, { id: 4, name: "Painter" },
  { id: 5, name: "Mechanic" }, { id: 6, name: "AC Repair" },
  { id: 7, name: "Cleaning" }, { id: 8, name: "Appliance Repair" },
];

const workers = [
  { id: 1, user: { id: 2, name: "Rajesh Kumar" }, city: "Bhopal", state: "Madhya Pradesh", pincode: "462001", experience: 8, hourlyRate: 450, availableForWork: true, verified: true, trustScore: 4.8, description: "Experienced electrician for home wiring, repairs, fans, switches and installations.", categories: [categories[0]] },
  { id: 2, user: { id: 3, name: "Amit Sharma" }, city: "Bhopal", state: "Madhya Pradesh", pincode: "462016", experience: 6, hourlyRate: 400, availableForWork: true, verified: true, trustScore: 4.6, description: "Reliable plumbing professional for leaks, fittings, pipelines and bathroom repairs.", categories: [categories[1]] },
  { id: 3, user: { id: 4, name: "Imran Khan" }, city: "Bhopal", state: "Madhya Pradesh", pincode: "462003", experience: 10, hourlyRate: 550, availableForWork: true, verified: true, trustScore: 4.9, description: "Skilled carpenter specialising in furniture repair, doors, cabinets and custom work.", categories: [categories[2]] },
  { id: 4, user: { id: 5, name: "Vikram Singh" }, city: "Indore", state: "Madhya Pradesh", pincode: "452001", experience: 7, hourlyRate: 500, availableForWork: false, verified: true, trustScore: 4.5, description: "Professional painter for interiors, exteriors, texture and finishing work.", categories: [categories[3]] },
  { id: 5, user: { id: 6, name: "Suresh Patel" }, city: "Bhopal", state: "Madhya Pradesh", pincode: "462022", experience: 9, hourlyRate: 600, availableForWork: true, verified: true, trustScore: 4.7, description: "Two-wheeler and car mechanic for servicing, diagnostics and repairs.", categories: [categories[4]] },
  { id: 6, user: { id: 7, name: "Deepak Verma" }, city: "Bhopal", state: "Madhya Pradesh", pincode: "462026", experience: 5, hourlyRate: 500, availableForWork: true, verified: true, trustScore: 4.4, description: "AC installation, servicing, gas charging and troubleshooting.", categories: [categories[5]] },
];

const demoUser = { id: 1, email: "demo@findingworker.local", name: "Demo Customer", phone: "9876543210", role: "CUSTOMER" };
const demoReviews = {
  1: [{ id: 1, rating: 5, comment: "Very professional and arrived on time.", customer: { name: "Priya" }, createdAt: "2026-08-20T10:00:00" }],
  2: [{ id: 2, rating: 4, comment: "Good work and reasonable pricing.", customer: { name: "Rahul" }, createdAt: "2026-08-18T12:00:00" }],
  3: [{ id: 3, rating: 5, comment: "Excellent finishing and communication.", customer: { name: "Neha" }, createdAt: "2026-08-15T15:00:00" }],
};

function readCookie(name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp("(?:^|; )" + escaped + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function readBookings() {
  try { return JSON.parse(localStorage.getItem("finding-worker-demo-bookings") || "[]"); }
  catch { return []; }
}
function writeBookings(rows) { localStorage.setItem("finding-worker-demo-bookings", JSON.stringify(rows)); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }

function demoRequest(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body) : null;
  const id = Number((path.match(/\/(\d+)(?:$|\?)/) || [])[1]);

  if (path === "/csrf") return { token: "demo-csrf" };
  if (path === "/api/profile/me") return clone(demoUser);
  if (path === "/get-all-categories") return clone(categories);
  if (path.startsWith("/get-category-by-id/")) return clone(categories.find(c => c.id === id));
  if (path.startsWith("/get-category-by-name/")) return clone(categories.find(c => c.name.toLowerCase() === decodeURIComponent(path.split("/").pop()).toLowerCase()));
  if (path.startsWith("/category-exists")) return false;

  if (path === "/api/worker-profiles/get-all-workers" || path === "/api/worker-profiles/available" || path === "/api/worker-profiles/verified") {
    return clone(workers.filter(w => path.endsWith("/available") ? w.availableForWork : path.endsWith("/verified") ? w.verified : true));
  }
  if (path.startsWith("/api/worker-profiles/get-worker-profile-by-id/")) return clone(workers.find(w => w.id === id));
  if (path.startsWith("/api/worker-profiles/search")) {
    const query = new URLSearchParams(path.split("?")[1] || "");
    let result = [...workers];
    const city = query.get("city"); const category = query.get("category");
    if (city) result = result.filter(w => w.city.toLowerCase().includes(city.toLowerCase()));
    if (category) result = result.filter(w => w.categories.some(c => c.name.toLowerCase() === category.toLowerCase()));
    if (query.get("available") !== null) result = result.filter(w => String(w.availableForWork) === query.get("available"));
    if (query.get("verified") !== null) result = result.filter(w => String(w.verified) === query.get("verified"));
    if (query.get("minExperience")) result = result.filter(w => w.experience >= Number(query.get("minExperience")));
    if (query.get("maxExperience")) result = result.filter(w => w.experience <= Number(query.get("maxExperience")));
    if (query.get("minHourlyRate")) result = result.filter(w => w.hourlyRate >= Number(query.get("minHourlyRate")));
    if (query.get("maxHourlyRate")) result = result.filter(w => w.hourlyRate <= Number(query.get("maxHourlyRate")));
    return clone(result);
  }

  if (path.startsWith("/get-reviews-by-worker-id/")) return clone(demoReviews[id] || []);
  if (path.startsWith("/get-worker-rating/")) {
    const reviews = demoReviews[id] || []; return reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  }
  if (path.startsWith("/get-worker-review-count/")) return (demoReviews[id] || []).length;

  if (path === "/create-booking" && method === "POST") {
    const rows = readBookings(); const worker = workers.find(w => w.id === Number(body?.worker?.id)) || workers[0];
    const booking = { id: Date.now(), worker: clone(worker), customer: clone(demoUser), serviceDate: body.serviceDate, address: body.address, description: body.description, status: "PENDING", bookingDate: new Date().toISOString() };
    rows.unshift(booking); writeBookings(rows); return clone(booking);
  }
  if (path.startsWith("/get-booking-by-id/") && method === "GET") return clone(readBookings().find(b => b.id === id));
  if (path.startsWith("/get-bookings-by-customer-id/")) return clone(readBookings().filter(b => b.customer?.id === Number(path.split("/").pop())));
  if (path.startsWith("/get-bookings-by-worker-id/")) return clone(readBookings().filter(b => b.worker?.user?.id === Number(path.split("/").pop())));
  if (path === "/update-booking" && method === "PUT") {
    const rows = readBookings(); const i = rows.findIndex(b => b.id === Number(body.id));
    if (i >= 0) rows[i] = { ...rows[i], ...body }; writeBookings(rows); return clone(rows[i]);
  }
  if (path.startsWith("/update-booking-status/") && method === "PUT") {
    const parts = path.split("/"); const bookingId = Number(parts[2]); const status = parts[3]; const rows = readBookings(); const b = rows.find(x => x.id === bookingId);
    if (b) b.status = status; writeBookings(rows); return clone(b);
  }
  if (path.startsWith("/cancel-booking/") && method === "PUT") {
    const rows = readBookings(); const b = rows.find(x => x.id === id); if (b) b.status = "CANCELLED"; writeBookings(rows); return clone(b);
  }

  if (path === "/api/users/update-user" && method === "PUT") return { ...clone(demoUser), ...body };
  if (path === "/create-review" && method === "POST") return { id: Date.now(), rating: body.rating, comment: body.comment, customer: clone(demoUser), createdAt: new Date().toISOString() };
  if (path === "/logout") return null;

  if (path === "/api/admin/users" || path === "/api/admin/workers") return [];
  if (path === "/api/admin/users/by-role") return [];
  if (path.startsWith("/api/admin/users/") || path.startsWith("/api/admin/workers/")) return null;
  if (path === "/create-category" || path === "/update-category" || path.startsWith("/delete-category")) return null;

  return null;
}

export function googleLoginUrl() { return DEMO_MODE ? "#demo-login" : `${API_URL}/oauth2/authorization/google`; }
export async function ensureCsrf() {
  if (DEMO_MODE) { csrfToken = "demo-csrf"; return csrfToken; }
  const res = await fetch(`${API_URL}/csrf`, { credentials: "include" });
  if (!res.ok) throw new Error("Could not fetch CSRF token");
  const data = await res.json(); csrfToken = data.token || readCookie("XSRF-TOKEN"); return csrfToken;
}

async function request(path, options = {}) {
  if (DEMO_MODE) return demoRequest(path, options);
  const method = (options.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD" && !csrfToken) await ensureCsrf();
  const headers = { Accept: "application/json", ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) };
  if (method !== "GET" && method !== "HEAD") headers["X-XSRF-TOKEN"] = csrfToken || readCookie("XSRF-TOKEN") || "";
  const res = await fetch(`${API_URL}${path}`, { ...options, method, credentials: "include", headers });
  if (res.status === 204) return null;
  const text = await res.text(); let data = null;
  if (text) { try { data = JSON.parse(text); } catch { data = text; } }
  if (!res.ok) { const message = (data && (data.message || data.error)) || (typeof data === "string" ? data : `Request failed (${res.status})`); const error = new Error(message); error.status = res.status; error.body = data; throw error; }
  return data;
}

export const api = {
  get: path => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  del: path => request(path, { method: "DELETE" }),
};

export const profileApi = { me: () => api.get("/api/profile/me"), complete: payload => api.post("/api/profile/complete", payload) };
export const categoryApi = { all: () => api.get("/get-all-categories"), byId: id => api.get(`/get-category-by-id/${id}`), byName: name => api.get(`/get-category-by-name/${encodeURIComponent(name)}`), exists: name => api.get(`/category-exists?name=${encodeURIComponent(name)}`), create: payload => api.post("/create-category", payload), update: payload => api.put("/update-category", payload), remove: id => api.del(`/delete-category-by-id/${id}`) };
export const workerApi = {
  all: () => api.get("/api/worker-profiles/get-all-workers"), available: () => api.get("/api/worker-profiles/available"), verified: () => api.get("/api/worker-profiles/verified"),
  searchByCity: city => api.get(`/api/worker-profiles/search?city=${encodeURIComponent(city)}`), searchByCategory: name => api.get(`/api/worker-profiles/search-by-category?name=${encodeURIComponent(name)}`),
  search: params => { const q = new URLSearchParams(); Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== "") q.set(k, v); }); const qs = q.toString(); return api.get(`/api/worker-profiles/search-workers${qs ? `?${qs}` : ""}`); },
  byId: id => api.get(`/api/worker-profiles/get-worker-profile-by-id/${id}`), create: payload => api.post("/api/worker-profiles/create-worker-profile", payload), update: payload => api.put("/api/worker-profiles/update-worker-profile", payload), remove: id => api.del(`/api/worker-profiles/delete-worker-profile-by-id/${id}`),
};
export const userApi = { byId: id => api.get(`/api/users/get-user-by-id/${id}`), update: payload => api.put("/api/users/update-user", payload), remove: id => api.del(`/api/users/delete-user-by-id/${id}`), byRole: role => api.get(`/api/users/get-users-by-role?role=${role}`), byEmail: email => api.get(`/api/users/get-user-by-email?email=${encodeURIComponent(email)}`) };
export const bookingApi = { create: payload => api.post("/create-booking", payload), byId: id => api.get(`/get-booking-by-id/${id}`), update: payload => api.put("/update-booking", payload), byCustomer: id => api.get(`/get-bookings-by-customer-id/${id}`), byWorkerUser: id => api.get(`/get-bookings-by-worker-id/${id}`), updateStatus: (id, status) => api.put(`/update-booking-status/${id}/${status}`), cancel: id => api.put(`/cancel-booking/${id}`) };
export const reviewApi = { create: payload => api.post("/create-review", payload), byId: id => api.get(`/get-review-by-id/${id}`), update: payload => api.put("/update-review", payload), remove: id => api.del(`/delete-review-by-id/${id}`), byWorker: id => api.get(`/get-reviews-by-worker-id/${id}`), avg: id => api.get(`/get-worker-rating/${id}`), count: id => api.get(`/get-worker-review-count/${id}`) };
export const adminApi = { users: () => api.get("/api/admin/users"), user: id => api.get(`/api/admin/users/${id}`), usersByRole: role => api.get(`/api/admin/users/by-role?role=${role}`), workers: () => api.get("/api/admin/workers"), verify: id => api.put(`/api/admin/workers/${id}/verify`) };
export async function logout() {
  if (DEMO_MODE) return;
  await ensureCsrf(); await fetch(`${API_URL}/logout`, { method: "POST", credentials: "include", headers: { "X-XSRF-TOKEN": csrfToken || readCookie("XSRF-TOKEN") || "" } }); csrfToken = null;
}
