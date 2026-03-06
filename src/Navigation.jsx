import { Link, useLocation } from "react-router-dom"

export function Navigation() {
  const location = useLocation()
  const linkStyle = (path, activeColor) => ({
    pointerEvents: "all",
    padding: "12px 28px",
    borderRadius: "30px",
    textDecoration: "none",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    fontWeight: 600,
    fontSize: "clamp(13px, 3.5vw, 15px)",
    letterSpacing: "0.5px",
    color: location.pathname === path ? "#fff" : "#333",
    background: location.pathname === path ? activeColor : "rgba(255,255,255,0.85)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(0,0,0,0.1)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    userSelect: "none",
  })
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      display: "flex",
      justifyContent: "center",
      gap: "12px",
      padding: "12px",
      pointerEvents: "none",
    }}>
      <Link to="/" style={linkStyle("/", "#555")}>
        ✦ Home
      </Link>
      <Link to="/kuche" style={linkStyle("/kuche", "#1a1a1a")}>
        🏠 Küche
      </Link>
      <Link to="/wohnzimmer" style={linkStyle("/wohnzimmer", "#2e7d32")}>
        🛋️ Wohnzimmer
      </Link>
    </div>
  )
}
