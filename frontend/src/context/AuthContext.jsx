import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEMO_MODE, ensureCsrf, googleLoginUrl, logout as apiLogout, profileApi } from "../api/client";

const AuthContext = createContext(null);
const DEMO_USER = { id: 1, email: "demo@findingworker.local", name: "Demo Customer", phone: "9876543210", role: "CUSTOMER" };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  async function refresh() {
    setError("");
    if (DEMO_MODE) { setUser(DEMO_USER); setStatus("ready"); return; }
    try {
      await ensureCsrf();
      const me = await profileApi.me(); setUser(me); setStatus("ready");
    } catch (err) {
      setUser(null);
      if (err.status === 401) setStatus("guest");
      else if (err.status === 404) setStatus("incomplete");
      else { setStatus("guest"); setError(err.message); }
    }
  }

  useEffect(() => { refresh(); }, []);
  const value = useMemo(() => ({
    user, setUser, status, error, refresh, isAuthed: status === "ready", needsProfile: status === "incomplete",
    loginWithGoogle: () => { if (DEMO_MODE) return; window.location.href = googleLoginUrl(); },
    logout: async () => { await apiLogout(); setUser(null); setStatus(DEMO_MODE ? "ready" : "guest"); },
  }), [user, status, error]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error("useAuth must be used within AuthProvider"); return ctx; }
