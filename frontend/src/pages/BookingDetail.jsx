import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { bookingApi, reviewApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { apiError, formatDateTime, statusTone, toDateTimeLocal } from "../lib.js";
import Protected from "../components/Protected.jsx";

function Inner() {
  const { id } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ serviceDate: "", address: "", description: "" });
  const [review, setReview] = useState({ rating: 5, comment: "" });

  async function load() {
    const b = await bookingApi.byId(id);
    setBooking(b);
    setForm({
      serviceDate: toDateTimeLocal(b.serviceDate),
      address: b.address || "",
      description: b.description || "",
    });
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [id]);

  async function save(e) {
    e.preventDefault();
    try {
      await bookingApi.update({
        id: Number(id),
        serviceDate: new Date(form.serviceDate).toISOString(),
        address: form.address,
        description: form.description,
      });
      setMsg("Booking updated");
      await load();
    } catch (err) {
      setError(apiError(err));
    }
  }

  async function changeStatus(status) {
    try {
      await bookingApi.updateStatus(id, status);
      await load();
    } catch (err) {
      setError(apiError(err));
    }
  }

  async function cancel() {
    try {
      await bookingApi.cancel(id);
      await load();
    } catch (err) {
      setError(apiError(err));
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    try {
      await reviewApi.create({
        booking: { id: Number(id) },
        rating: Number(review.rating),
        comment: review.comment,
      });
      setMsg("Review submitted");
    } catch (err) {
      setError(apiError(err));
    }
  }

  if (!booking && !error) return <div className="page"><p className="muted">Loading booking…</p></div>;

  return (
    <div className="page grid grid-2">
      <div className="panel">
        <p className="kicker" style={{ color: "var(--green)" }}>Request #{booking?.id}</p>
        <h2 className="serif">Booking details</h2>
        {error && <div className="alert">{error}</div>}
        {msg && <div className="alert ok">{msg}</div>}
        <p><span className={`pill ${statusTone(booking?.status)}`}>{booking?.status}</span></p>
        <p>Worker: {booking?.worker?.user?.name || booking?.worker?.id}</p>
        <p className="muted">Created {formatDateTime(booking?.bookingDate)}</p>
        {user.role === "CUSTOMER" && booking?.status === "PENDING" && (
          <form className="form" onSubmit={save}>
            <label>Service date<input type="datetime-local" value={form.serviceDate} onChange={(e) => setForm({ ...form, serviceDate: e.target.value })} /></label>
            <label>Address<textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
            <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <button className="btn btn-green">Save changes</button>
          </form>
        )}
        {user.role === "WORKER" && booking?.status === "PENDING" && (
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn btn-green" onClick={() => changeStatus("ACCEPTED")}>Accept</button>
            <button className="btn btn-outline" onClick={() => changeStatus("REJECTED")}>Reject</button>
          </div>
        )}
        {user.role === "WORKER" && booking?.status === "ACCEPTED" && (
          <button className="btn btn-green" style={{ marginTop: 12 }} onClick={() => changeStatus("COMPLETED")}>
            Mark completed
          </button>
        )}
        {(booking?.status === "PENDING" || booking?.status === "ACCEPTED") && (
          <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={cancel}>Cancel booking</button>
        )}
      </div>
      {user.role === "CUSTOMER" && booking?.status === "COMPLETED" && (
        <form className="panel form" onSubmit={submitReview}>
          <h3>Leave a review</h3>
          <label>Rating
            <select value={review.rating} onChange={(e) => setReview({ ...review, rating: e.target.value })}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label>Comment
            <textarea value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} />
          </label>
          <button className="btn btn-green">Submit review</button>
        </form>
      )}
    </div>
  );
}

export default function BookingDetail() {
  return <Protected roles={["CUSTOMER", "WORKER"]}><Inner /></Protected>;
}
