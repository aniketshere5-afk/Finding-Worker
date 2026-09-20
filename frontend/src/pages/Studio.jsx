import { useEffect, useState } from "react";
import { categoryApi, workerApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { apiError } from "../lib.js";
import Protected from "../components/Protected.jsx";

const empty = {
  experience: 1,
  hourlyRate: 300,
  description: "",
  city: "",
  state: "",
  pincode: "",
  availableForWork: true,
  categoryIds: [],
};

function Inner() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const [cats, workers] = await Promise.all([categoryApi.all(), workerApi.all()]);
    setCategories(cats);
    const mine = workers.find((w) => w.user?.id === user.id);
    setProfile(mine || null);
    if (mine) {
      setForm({
        experience: mine.experience,
        hourlyRate: mine.hourlyRate,
        description: mine.description || "",
        city: mine.city || "",
        state: mine.state || "",
        pincode: mine.pincode || "",
        availableForWork: !!mine.availableForWork,
        categoryIds: (mine.categories || []).map((c) => c.id),
      });
    }
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [user.id]);

  function toggleCat(id) {
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter((x) => x !== id)
        : [...f.categoryIds, id],
    }));
  }

  function payload() {
    return {
      ...(profile ? { id: profile.id } : {}),
      experience: Number(form.experience),
      hourlyRate: Number(form.hourlyRate),
      description: form.description,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      availableForWork: form.availableForWork,
      verified: profile?.verified || false,
      trustScore: profile?.trustScore || 0,
      categories: form.categoryIds.map((id) => ({ id })),
    };
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    try {
      if (profile) {
        await workerApi.update(payload());
        setMsg("Profile updated");
      } else {
        await workerApi.create(payload());
        setMsg("Profile created. An admin must verify you before customers can book.");
      }
      await load();
    } catch (err) {
      setError(apiError(err));
    }
  }

  async function remove() {
    if (!profile) return;
    try {
      await workerApi.remove(profile.id);
      setProfile(null);
      setForm(empty);
      setMsg("Profile deleted");
    } catch (err) {
      setError(apiError(err));
    }
  }

  return (
    <div className="page">
      <div className="section-head">
        <div>
          <p className="kicker" style={{ color: "var(--green)" }}>Worker studio</p>
          <h2>{profile ? "Update your public profile" : "Create your worker profile"}</h2>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      {msg && <div className="alert ok">{msg}</div>}
      {profile && (
        <div className="meta" style={{ marginBottom: 16 }}>
          {profile.verified ? <span className="pill ok">Verified</span> : <span className="pill warn">Awaiting verification</span>}
          <span className="pill">Trust {Number(profile.trustScore || 0).toFixed(1)}</span>
        </div>
      )}
      <form className="panel form" onSubmit={save}>
        <div className="row">
          <label>Experience (years)<input type="number" min="1" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} /></label>
          <label>Hourly rate (₹)<input type="number" min="1" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} /></label>
        </div>
        <label>About you<textarea required maxLength={500} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <div className="row">
          <label>City<input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
          <label>State<input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></label>
        </div>
        <label>Pincode<input required minLength={6} maxLength={6} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} /></label>
        <label>
          <span>Available for work</span>
          <select value={String(form.availableForWork)} onChange={(e) => setForm({ ...form, availableForWork: e.target.value === "true" })}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <div>
          <strong>Categories</strong>
          <div className="meta" style={{ marginTop: 8 }}>
            {categories.map((c) => (
              <button type="button" key={c.id} className={`pill ${form.categoryIds.includes(c.id) ? "ok" : ""}`} onClick={() => toggleCat(c.id)}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-green" type="submit">{profile ? "Save profile" : "Publish profile"}</button>
        {profile && <button className="btn btn-outline" type="button" onClick={remove}>Delete profile</button>}
      </form>
    </div>
  );
}

export default function Studio() {
  return <Protected roles={["WORKER"]}><Inner /></Protected>;
}
