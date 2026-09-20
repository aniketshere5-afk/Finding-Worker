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
    bookingApi.byCustomer(user.id).then(setRows).catch((e) => setError(e.message));
  }, [user.id]);

  return (
    <div className="page">
      <div className="section-head">
        <div>
          <p className="kicker" style={{ color: "var(--green)" }}>Your requests</p>
          <h2>Bookings</h2>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      <div className="panel" style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>When</th>
              <th>Worker</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id}>
                <td>{formatDateTime(b.serviceDate)}</td>
                <td>{b.worker?.user?.name || `Worker #${b.worker?.id}`}</td>
                <td><span className={`pill ${statusTone(b.status)}`}>{b.status}</span></td>
                <td><Link to={`/bookings/${b.id}`}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="muted">No bookings yet.</p>}
      </div>
    </div>
  );
}

export default function Bookings() {
  return <Protected roles={["CUSTOMER"]}><Inner /></Protected>;
}
