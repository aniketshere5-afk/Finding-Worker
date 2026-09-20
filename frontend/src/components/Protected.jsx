import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Protected({ roles, children }) {
  const { status, user, loginWithGoogle } = useAuth();

  if (status === "loading") {
    return <div className="page"><p className="muted">Loading your session…</p></div>;
  }
  if (status === "incomplete") return <Navigate to="/complete-profile" replace />;
  if (status !== "ready") {
    return (
      <div className="page">
        <div className="panel" style={{ maxWidth: 520 }}>
          <p className="kicker">Sign in required</p>
          <h2 className="serif">Continue to Finding Worker</h2>
          <p className="muted">Google sign-in is the only auth method this backend exposes.</p>
          <button className="btn btn-green" onClick={loginWithGoogle}>Continue with Google</button>
        </div>
      </div>
    );
  }
  if (roles && !roles.includes(user.role)) {
    return <div className="page"><div className="alert">You are not authorized to view this page.</div></div>;
  }
  return children;
}
