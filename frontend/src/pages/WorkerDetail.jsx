import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { reviewApi, workerApi } from "../api/client.js";
import { categoryVisual, formatDateTime, formatMoney } from "../lib.js";
import Protected from "../components/Protected.jsx";
import Stars from "../components/Stars.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Inner() {
  const { id } = useParams();
  const { user } = useAuth();
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      workerApi.byId(id),
      reviewApi.byWorker(id),
      reviewApi.avg(id),
      reviewApi.count(id),
    ])
      .then(([w, r, a, c]) => {
        setWorker(w);
        setReviews(r);
        setAvg(a);
        setCount(c);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="page"><div className="alert">{error}</div></div>;
  if (!worker) return <div className="page"><p className="muted">Loading profile…</p></div>;

  const first = worker.categories?.[0]?.name || "Professional";
  const v = categoryVisual(first);

  return (
    <div className="page cart-shell">
      <div>
        <div className="cover" style={{ background: v.tint, height: 180, borderRadius: 18, display: "grid", placeItems: "center", fontSize: 64 }}>
          {v.icon}
        </div>
        <h1 className="serif">{worker.user?.name || "Worker"}</h1>
        <p className="muted">{worker.city}, {worker.state} · PIN {worker.pincode}</p>
        <div className="meta">
          {worker.verified && <span className="pill ok">Verified</span>}
          {worker.availableForWork ? <span className="pill info">Available</span> : <span className="pill muted">Unavailable</span>}
          <span className="pill">Trust score {Number(worker.trustScore || 0).toFixed(1)}</span>
          <span className="pill">{worker.experience} yrs experience</span>
        </div>
        <p>{worker.description}</p>
        <div className="meta">
          {(worker.categories || []).map((c) => (
            <span className="pill" key={c.id}>{c.name}</span>
          ))}
        </div>
        <h3>Reviews ({count})</h3>
        <p><Stars value={avg} /> {Number(avg).toFixed(1)} average</p>
        <div className="grid">
          {reviews.map((r) => (
            <article className="panel" key={r.id}>
              <Stars value={r.rating} />
              <p>{r.comment || "No written comment"}</p>
              <p className="muted">{r.customer?.name || "Customer"} · {formatDateTime(r.createdAt)}</p>
            </article>
          ))}
        </div>
      </div>
      <aside className="panel sticky-cart">
        <div className="kicker" style={{ color: "var(--green)" }}>Service cart</div>
        <h3>Book this professional</h3>
        <p className="price">{formatMoney(worker.hourlyRate)} <span className="muted">/ hour</span></p>
        <p className="muted">Only verified, available workers can be booked by the backend.</p>
        {user.role === "CUSTOMER" ? (
          <Link className="btn btn-green btn-block" to={`/book/${worker.id}`}>Continue to booking</Link>
        ) : (
          <p className="muted">Switch to a customer account to send a request.</p>
        )}
      </aside>
    </div>
  );
}

export default function WorkerDetail() {
  return <Protected><Inner /></Protected>;
}
