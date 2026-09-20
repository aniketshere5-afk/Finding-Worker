import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bookingApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDateTime, statusTone } from "../lib.js";
import Protected from "../components/Protected.jsx";

function Inner() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    bookingApi.byWorkerUser(user.id).then(setRows).catch((e) => setError(e.message));
  }, [user.id]);

  return (
    <div className="page">
      <div className="section-head">
        <div>
          <p className="kicker" style={{ color: "var(--green)" }}>Incoming work</p>
          <h2>Job requests</h2>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      <div className="grid">
        {rows.map((b) => (
          <Link className="panel" key={b.id} to={`/bookings/${b.id}`}>
            <div className="meta">
              <span className={`pill ${statusTone(b.status)}`}>{b.status}</span>
              <span className="muted">{formatDateTime(b.serviceDate)}</span>
            </div>
            <h3>{b.customer?.name || "Customer"}</h3>
            <p>{b.description}</p>
            <p className="muted">{b.address}</p>
          </Link>
        ))}
      </div>
      {!rows.length && !error && <p className="muted">No job requests yet.</p>}
    </div>
  );
}

export default function Jobs() {
  return <Protected roles={["WORKER"]}><Inner /></Protected>;
}
