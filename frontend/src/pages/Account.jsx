import { useState } from "react";
import { userApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { apiError } from "../lib.js";
import Protected from "../components/Protected.jsx";

function Inner() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user.name || "", phone: user.phone || "" });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function save(e) {
    e.preventDefault();
    setError("");
    try {
      const updated = await userApi.update({
        id: user.id,
        email: user.email,
        name: form.name,
        phone: form.phone,
      });
      setUser(updated);
      setMsg("Account updated");
    } catch (err) {
      setError(apiError(err));
    }
  }

  return (
    <div className="page">
      <h2 className="serif">Your account</h2>
      {error && <div className="alert">{error}</div>}
      {msg && <div className="alert ok">{msg}</div>}
      <form className="panel form" style={{ maxWidth: 520 }} onSubmit={save}>
        <p className="muted">{user.email} · {user.role}</p>
        <label>Name<input required minLength={2} maxLength={21} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>Phone<input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        <button className="btn btn-green">Save</button>
      </form>
    </div>
  );
}

export default function Account() {
  return <Protected><Inner /></Protected>;
}
