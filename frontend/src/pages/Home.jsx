import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { categoryApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { categoryVisual } from "../lib.js";

const FALLBACK = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painter",
  "Mechanic",
  "AC Repair",
];

export default function Home() {
  const { status, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [city, setCity] = useState("Bhopal");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (status !== "ready") return;
    categoryApi.all().then(setCategories).catch(() => setCategories([]));
  }, [status]);

  const shown = categories.length ? categories : FALLBACK.map((name) => ({ id: name, name }));

  function go(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    navigate(`/workers?${params.toString()}`);
  }

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="kicker">crafted for the creditworthy</div>
          <h1>find skilled workers you can actually trust</h1>
          <p>
            Search electricians, plumbers, carpenters, painters and mechanics by city,
            compare ratings, and send a service request in minutes — without chasing
            WhatsApp groups.
          </p>
          <form className="search-bar" onSubmit={go}>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All services</option>
              {shown.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <button className="btn btn-green" type="submit">Search</button>
          </form>
          <div className="hero-actions">
            {status !== "ready" && (
              <button className="btn btn-green" onClick={loginWithGoogle}>Get started with Google</button>
            )}
            <Link className="btn btn-ghost" to="/services">Browse services</Link>
          </div>
        </div>
      </section>
      <section className="page">
        <div className="section-head">
          <div>
            <p className="kicker" style={{ color: "var(--green)" }}>Urban Company style catalog</p>
            <h2>Home services, booked the simple way</h2>
          </div>
          <Link to="/services">See all →</Link>
        </div>
        <div className="grid grid-3">
          {shown.map((c) => {
            const v = categoryVisual(c.name);
            return (
              <Link key={c.id} className="cat-card" to={`/workers?category=${encodeURIComponent(c.name)}`}>
                <div className="cat-icon" style={{ background: v.tint }}>{v.icon}</div>
                <h3>{c.name}</h3>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
