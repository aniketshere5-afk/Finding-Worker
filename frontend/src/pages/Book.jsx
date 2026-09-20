import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { bookingApi, workerApi } from "../api/client.js";
import { apiError, categoryVisual, formatMoney } from "../lib.js";
import Protected from "../components/Protected.jsx";

function Inner() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    serviceDate: "",
    address: "",
    description: "",
  });

  useEffect(() => {
    workerApi.byId(workerId).then(setWorker).catch((e) => setError(e.message));
  }, [workerId]);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const booking = await bookingApi.create({
        worker: { id: Number(workerId) },
        serviceDate: form.serviceDate ? new Date(form.serviceDate).toISOString() : null,
        address: form.address,
        description: form.description,
      });
      navigate(`/bookings/${booking.id}`);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSaving(false);
    }
  }

  if (!worker && !error) return <div className="page"><p className="muted">Loading…</p></div>;
  const v = categoryVisual(worker?.categories?.[0]?.name);

  return (
    <div className="page cart-shell">
      <form className="panel form" onSubmit={submit}>
        <p className="kicker" style={{ color: "var(--green)" }}>Checkout</p>
        <h2 className="serif">Confirm your service request</h2>
        {error && <div className="alert">{error}</div>}
        <label>Service date & time
          <input type="datetime-local" required value={form.serviceDate} onChange={(e) => setForm({ ...form, serviceDate: e.target.value })} />
        </label>
        <label>Address
          <textarea required maxLength={300} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </label>
        <label>What do you need done?
          <textarea required maxLength={500} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <button className="btn btn-green" disabled={saving}>{saving ? "Sending…" : "Send request"}</button>
      </form>
      <aside className="panel sticky-cart">
        <div className="service-row" style={{ border: 0, padding: 0 }}>
          <div className="thumb" style={{ background: v.tint }}>{v.icon}</div>
          <div>
            <strong>{worker?.user?.name}</strong>
            <div className="muted">{worker?.city} · {worker?.experience} yrs</div>
          </div>
        </div>
        <hr />
        <p>Hourly rate</p>
        <p className="price">{formatMoney(worker?.hourlyRate)}</p>
        <p className="muted">The worker will accept, reject or complete this request from their job inbox.</p>
      </aside>
    </div>
  );
}

export default function Book() {
  return <Protected roles={["CUSTOMER"]}><Inner /></Protected>;
}
