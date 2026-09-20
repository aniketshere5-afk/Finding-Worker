import { useEffect, useState } from "react";
import { adminApi, categoryApi, userApi } from "../api/client.js";
import { apiError } from "../lib.js";
import Protected from "../components/Protected.jsx";

function Inner() {
  const [tab, setTab] = useState("workers");
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [role, setRole] = useState("CUSTOMER");
  const [email, setEmail] = useState("");
  const [found, setFound] = useState(null);
  const [catName, setCatName] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const [u, w, c] = await Promise.all([adminApi.users(), adminApi.workers(), categoryApi.all()]);
    setUsers(u);
    setWorkers(w);
    setCategories(c);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function filterRole() {
    try {
      setUsers(await adminApi.usersByRole(role));
    } catch (e) {
      setError(apiError(e));
    }
  }

  async function lookup(e) {
    e.preventDefault();
    try {
      setFound(await userApi.byEmail(email));
    } catch (err) {
      setFound(null);
      setError(apiError(err));
    }
  }

  async function verify(id) {
    try {
      await adminApi.verify(id);
      setMsg("Worker verified");
      await load();
    } catch (err) {
      setError(apiError(err));
    }
  }

  async function addCategory(e) {
    e.preventDefault();
    try {
      const exists = await categoryApi.exists(catName);
      if (exists) {
        setError("That category already exists");
        return;
      }
      await categoryApi.create({ name: catName });
      setCatName("");
      setMsg("Category created");
      await load();
    } catch (err) {
      setError(apiError(err));
    }
  }

  async function rename(cat) {
    const name = window.prompt("New category name", cat.name);
    if (!name) return;
    try {
      await categoryApi.update({ id: cat.id, name });
      await load();
    } catch (err) {
      setError(apiError(err));
    }
  }

  async function removeCat(id) {
    try {
      await categoryApi.remove(id);
      await load();
    } catch (err) {
      setError(apiError(err));
    }
  }

  async function removeUser(id) {
    try {
      await userApi.remove(id);
      await load();
    } catch (err) {
      setError(apiError(err));
    }
  }

  return (
    <div className="page">
      <div className="section-head">
        <div>
          <p className="kicker" style={{ color: "var(--green)" }}>Admin</p>
          <h2>Trust, users and catalog</h2>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      {msg && <div className="alert ok">{msg}</div>}
      <div className="meta" style={{ marginBottom: 16 }}>
        {["workers", "users", "categories"].map((t) => (
          <button key={t} className={`pill ${tab === t ? "ok" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "workers" && (
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="table">
            <thead><tr><th>Worker</th><th>City</th><th>Verified</th><th></th></tr></thead>
            <tbody>
              {workers.map((w) => (
                <tr key={w.id}>
                  <td>{w.user?.name || w.id}</td>
                  <td>{w.city}</td>
                  <td>{w.verified ? "Yes" : "No"}</td>
                  <td>{!w.verified && <button className="btn btn-green btn-sm" onClick={() => verify(w.id)}>Verify</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "users" && (
        <div className="grid">
          <div className="panel form">
            <div className="row">
              <label>Filter by role
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option>CUSTOMER</option>
                  <option>WORKER</option>
                  <option>ADMIN</option>
                </select>
              </label>
              <button className="btn btn-outline" type="button" onClick={filterRole}>Apply</button>
            </div>
            <form className="row" onSubmit={lookup}>
              <label>Lookup email<input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
              <button className="btn btn-green" type="submit">Find</button>
            </form>
            {found && <p>{found.name} · {found.role} · {found.phone}</p>}
          </div>
          <div className="panel" style={{ overflowX: "auto" }}>
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td><button className="btn btn-outline btn-sm" onClick={() => removeUser(u.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "categories" && (
        <div className="grid grid-2">
          <form className="panel form" onSubmit={addCategory}>
            <label>New category<input value={catName} onChange={(e) => setCatName(e.target.value)} required /></label>
            <button className="btn btn-green">Create</button>
          </form>
          <div className="panel">
            {categories.map((c) => (
              <div key={c.id} className="meta" style={{ marginBottom: 8 }}>
                <strong>{c.name}</strong>
                <button className="btn btn-outline btn-sm" onClick={() => rename(c)}>Rename</button>
                <button className="btn btn-outline btn-sm" onClick={() => removeCat(c.id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  return <Protected roles={["ADMIN"]}><Inner /></Protected>;
}
