export const CATEGORY_VISUALS = {
  electrician: { icon: "⚡", tint: "#FFF4D6" },
  plumber: { icon: "🚿", tint: "#E7F4FF" },
  carpenter: { icon: "🪵", tint: "#F6E7D8" },
  painter: { icon: "🎨", tint: "#F3E8FF" },
  mechanic: { icon: "🔧", tint: "#E8F8EE" },
  ac: { icon: "❄️", tint: "#E8FBFF" },
  cleaning: { icon: "✨", tint: "#FDEEF4" },
  salon: { icon: "✂️", tint: "#FDECEC" },
  appliance: { icon: "📺", tint: "#EEF0FF" },
  pest: { icon: "🛡️", tint: "#EAF8E8" },
};

export function categoryVisual(name = "") {
  const key = Object.keys(CATEGORY_VISUALS).find((k) =>
    name.toLowerCase().includes(k)
  );
  return CATEGORY_VISUALS[key] || { icon: "🛠️", tint: "#F4F4F1" };
}

export function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = Array.isArray(value)
    ? new Date(value[0], value[1] - 1, value[2], value[3] || 0, value[4] || 0)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toDateTimeLocal(value) {
  if (!value) return "";
  const date = Array.isArray(value)
    ? new Date(value[0], value[1] - 1, value[2], value[3] || 0, value[4] || 0)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function statusTone(status) {
  return (
    {
      PENDING: "warn",
      ACCEPTED: "info",
      COMPLETED: "ok",
      REJECTED: "bad",
      CANCELLED: "muted",
    }[status] || "muted"
  );
}

export function apiError(err) {
  if (err?.body?.errors) {
    return Object.values(err.body.errors).join(" · ");
  }
  return err?.message || "Something went wrong";
}
