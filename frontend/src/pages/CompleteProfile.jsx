import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { profileApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { apiError } from "../lib.js";

export default function CompleteProfile() {
  const { status, refresh, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: "", role: "CUSTOMER" });
  const [error, setError] = useState("");

  if (status === "ready") return <Navigate to="/" replace />;
  if (status === "guest") {
    return (
      <div className="page">
        <div className="panel" style={{ maxWidth: 480 }}>
          <h2 className="serif">Sign in first</h2>
          <p className="muted">Google login creates a session, then you choose Customer or Worker.</p>
          <button className="btn btn-green" onClick={loginWithGoogle}>Continue with Google</button>
        </div>
      </div>
    );
  }
  if (status === "loading") return <div className="page"><p className="muted">Loading…</p></div>;

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await profileApi.complete(form);
      await refresh();
      navigate(form.role === "WORKER" ? "/studio" : "/services");
    } catch (err) {
      setError(apiError(err));
    }
  }

  return (
    <div className="page">
      <form className="panel form" style={{ maxWidth: 520 }} onSubmit={submit}>
        <p className="kicker" style={{ color: "var(--green)" }}>Almost there</p>
        <h2 className="serif">Complete your profile</h2>
        {error && <div className="alert">{error}</div>}
        <label>Phone
          <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile" />
        </label>
        <label>I am a
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="CUSTOMER">Customer looking for help</option>
            <option value="WORKER">Skilled worker offering services</option>
          </select>
        </label>
        <button className="btn btn-green">Finish setup</button>
      </form>
    </div>
  );
}
