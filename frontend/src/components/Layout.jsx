import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout() {
  const { user, status, loginWithGoogle, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/services", label: "Services" },
    { to: "/workers", label: "Find workers" },
  ];
  if (user?.role === "CUSTOMER") links.push({ to: "/bookings", label: "My bookings" });
  if (user?.role === "WORKER") {
    links.push({ to: "/studio", label: "Worker studio" });
    links.push({ to: "/jobs", label: "Job requests" });
  }
  if (user?.role === "ADMIN") links.push({ to: "/admin", label: "Admin" });
  if (user) links.push({ to: "/account", label: "Account" });

  return (
    <>
      <header className="site-header">
        <nav className="nav">
          <Link to="/" className="brand">
            <img src="/logo.png" alt="Finding Worker" />
            <span className="brand-copy">
              <strong>FINDING WORKER</strong>
              <span>skilled help nearby</span>
            </span>
          </Link>
          <div className={`nav-links ${open ? "open" : ""}`} onClick={() => setOpen(false)}>
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === "/"}>
                {l.label}
              </NavLink>
            ))}
          </div>
          <div className="nav-actions">
            {status === "ready" ? (
              <>
                <span className="chip">{user.name} · {user.role}</span>
                <button className="btn btn-black btn-sm" onClick={logout}>Sign out</button>
              </>
            ) : (
              <button className="btn btn-green btn-sm" onClick={loginWithGoogle}>
                Continue with Google
              </button>
            )}
            <button className="btn btn-ghost btn-sm menu-btn" onClick={() => setOpen((v) => !v)}>
              Menu
            </button>
          </div>
        </nav>
      </header>
      <Outlet />
      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <img src="/logo.png" alt="" width="56" />
            <p>Finding Worker connects people with verified electricians, plumbers, carpenters, painters, mechanics and more.</p>
          </div>
          <div>
            <h4>Customers</h4>
            <p><Link to="/services">Browse services</Link></p>
            <p><Link to="/workers">Search professionals</Link></p>
          </div>
          <div>
            <h4>Workers</h4>
            <p><Link to="/studio">Create your profile</Link></p>
            <p><Link to="/jobs">Manage requests</Link></p>
          </div>
          <div>
            <h4>Trust</h4>
            <p>Ratings, reviews, verification and a trust score built from completed jobs.</p>
          </div>
        </div>
        <div className="legal">© {new Date().getFullYear()} Finding Worker</div>
      </footer>
    </>
  );
}
