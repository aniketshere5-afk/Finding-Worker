import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { categoryApi, workerApi } from "../api/client.js";
import { categoryVisual, formatMoney } from "../lib.js";
import Protected from "../components/Protected.jsx";
import Stars from "../components/Stars.jsx";
import { reviewApi } from "../api/client.js";

function WorkerCard({ worker }) {
  const [rating, setRating] = useState(null);
  const first = worker.categories?.[0]?.name || "Professional";
  const v = categoryVisual(first);

  useEffect(() => {
    reviewApi.avg(worker.id).then(setRating).catch(() => setRating(0));
  }, [worker.id]);

  return (
    <Link className="worker-card" to={`/workers/${worker.id}`}>
      <div className="cover" style={{ background: v.tint }}>{v.icon}</div>
      <div className="body">
        <strong>{worker.user?.name || "Skilled worker"}</strong>
        <div className="muted">{worker.city}, {worker.state}</div>
        <div className="meta">
          {worker.verified && <span className="pill ok">Verified</span>}
          {worker.availableForWork ? <span className="pill info">Available</span> : <span className="pill muted">Busy</span>}
          <span className="pill">Trust {Number(worker.trustScore || 0).toFixed(1)}</span>
        </div>
        <div><Stars value={rating} /> · {formatMoney(worker.hourlyRate)}/hr</div>
      </div>
    </Link>
  );
}

function Inner() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    city: params.get("city") || "",
    category: params.get("category") || "",
    available: "",
    verified: "",
    minExperience: "",
    maxExperience: "",
    minHourlyRate: "",
    maxHourlyRate: "",
  });

  useEffect(() => {
    categoryApi.all().then(setCategories).catch(() => {});
  }, []);

  async function run(e) {
    e?.preventDefault();
    setError("");
    const next = new URLSearchParams();
    Object.entries(form).forEach(([k, v]) => v && next.set(k, v));
    setParams(next);
    try {
      const data = await workerApi.search({
        city: form.city || undefined,
        category: form.category || undefined,
        available: form.available === "" ? undefined : form.available,
        verified: form.verified === "" ? undefined : form.verified,
        minExperience: form.minExperience || undefined,
        maxExperience: form.maxExperience || undefined,
        minHourlyRate: form.minHourlyRate || undefined,
        maxHourlyRate: form.maxHourlyRate || undefined,
      });
      setWorkers(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <div className="page">
      <div className="section-head">
        <div>
          <p className="kicker" style={{ color: "var(--green)" }}>Compare professionals</p>
          <h2>Workers matched to your filters</h2>
        </div>
      </div>
      <form className="panel form" onSubmit={run} style={{ marginBottom: 20 }}>
        <div className="row">
          <label>City<input value={form.city} onChange={(e) => set("city", e.target.value)} /></label>
          <label>Category
            <select value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="">Any</option>
              {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </label>
        </div>
        <div className="row">
          <label>Available
            <select value={form.available} onChange={(e) => set("available", e.target.value)}>
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <label>Verified
            <select value={form.verified} onChange={(e) => set("verified", e.target.value)}>
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
        </div>
        <div className="row">
          <label>Min experience<input type="number" value={form.minExperience} onChange={(e) => set("minExperience", e.target.value)} /></label>
          <label>Max experience<input type="number" value={form.maxExperience} onChange={(e) => set("maxExperience", e.target.value)} /></label>
        </div>
        <div className="row">
          <label>Min hourly rate<input type="number" value={form.minHourlyRate} onChange={(e) => set("minHourlyRate", e.target.value)} /></label>
          <label>Max hourly rate<input type="number" value={form.maxHourlyRate} onChange={(e) => set("maxHourlyRate", e.target.value)} /></label>
        </div>
        <button className="btn btn-green" type="submit">Apply filters</button>
      </form>
      {error && <div className="alert">{error}</div>}
      <div className="grid grid-3">
        {workers.map((w) => <WorkerCard key={w.id} worker={w} />)}
      </div>
      {!workers.length && <p className="muted">No workers matched those filters.</p>}
    </div>
  );
}

export default function Workers() {
  return <Protected><Inner /></Protected>;
}
