import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { categoryApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { categoryVisual } from "../lib.js";
import Protected from "../components/Protected.jsx";

function Inner() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    categoryApi.all().then(setCategories).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="page">
      <div className="section-head">
        <div>
          <p className="kicker" style={{ color: "var(--green)" }}>Services</p>
          <h2>Pick a category, compare professionals</h2>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      <div className="grid grid-4">
        {categories.map((c) => {
          const v = categoryVisual(c.name);
          return (
            <Link key={c.id} className="cat-card" to={`/workers?category=${encodeURIComponent(c.name)}`}>
              <div className="cat-icon" style={{ background: v.tint }}>{v.icon}</div>
              <div>
                <h3>{c.name}</h3>
                <p className="muted">Verified pros · ratings · hourly rates</p>
              </div>
            </Link>
          );
        })}
      </div>
      {!categories.length && !error && <p className="muted">No categories yet. An admin can add them.</p>}
    </div>
  );
}

export default function Services() {
  return (
    <Protected>
      <Inner />
    </Protected>
  );
}
