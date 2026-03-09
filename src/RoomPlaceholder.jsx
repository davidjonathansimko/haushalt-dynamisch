import { useParams, useNavigate } from "react-router-dom"
import { useTranslations } from "./i18n"
import { isMobile as checkMobile } from "./shared"
import { useState, useEffect } from "react"

export function RoomPlaceholder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const t = useTranslations()
  const [mobile, setMobile] = useState(checkMobile())

  useEffect(() => {
    const r = () => setMobile(checkMobile())
    window.addEventListener("resize", r)
    return () => window.removeEventListener("resize", r)
  }, [])

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "#111",
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      fontFamily: "'Inter','Segoe UI',sans-serif",
      color: "#fff",
    }}>
      {/* Background image */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(/room${id}.jpg)`,
        backgroundSize: "cover", backgroundPosition: "center",
        opacity: 0.25,
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: 32 }}>
        <div style={{
          fontSize: "clamp(10px, 2.5vw, 12px)", fontWeight: 600,
          letterSpacing: "3px", textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)", marginBottom: 16,
        }}>
          ✦ Haushalt
        </div>
        <h1 style={{
          fontSize: "clamp(36px, 10vw, 72px)", fontWeight: 800,
          letterSpacing: "-2px", margin: 0, lineHeight: 1,
        }}>
          {t.room || "Zimmer"} {id}
        </h1>
        <p style={{
          fontSize: "clamp(13px, 3vw, 16px)",
          color: "rgba(255,255,255,0.45)",
          marginTop: 20, maxWidth: 400, lineHeight: 1.6,
        }}>
          {t.comingSoon || "Coming soon — 3D-Erlebnis wird bald verfügbar sein."}
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32 }}>
          <button
            onClick={() => navigate("/galerie")}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 28, padding: mobile ? "12px 24px" : "12px 28px",
              color: "#fff", fontSize: mobile ? 12 : 13, fontWeight: 600,
              cursor: "pointer", letterSpacing: "0.5px",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              fontFamily: "'Inter','Segoe UI',sans-serif",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            ← {t.gallery}
          </button>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "#fff", color: "#111",
              border: "none", borderRadius: 28,
              padding: mobile ? "12px 24px" : "12px 28px",
              fontSize: mobile ? 12 : 13, fontWeight: 700,
              cursor: "pointer", letterSpacing: "0.5px",
              fontFamily: "'Inter','Segoe UI',sans-serif",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {t.navHome}
          </button>
        </div>
      </div>
    </div>
  )
}
