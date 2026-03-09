import { useState, useEffect, useRef, forwardRef } from "react"
import { Link } from "react-router-dom"
import { useLang, useTranslations, useCurrency, langLabels, langFlags, useTheme } from "./i18n"
import { isMobile as checkMobile } from "./shared"

// ===== THEME PALETTE =====
const themes = {
  light: {
    bg: "#f5f2ee", text: "#1a1a1a", textSoft: "#777", textMuted: "#999", textFaint: "#aaa", textUltra: "#ccc",
    cardBg: "#fff", cardBorder: "rgba(0,0,0,0.06)", cardShadow: "0 2px 16px rgba(0,0,0,0.03)",
    cardHoverBg: "#1a1a1a", cardHoverText: "#fff", cardHoverSoft: "rgba(255,255,255,0.6)",
    navBg: "rgba(245,242,238,0.85)", navBorder: "rgba(0,0,0,0.04)",
    pillBg: "rgba(0,0,0,0.04)", pillActive: "#1a1a1a", pillActiveText: "#fff", pillText: "#999",
    btnBorder: "rgba(0,0,0,0.12)", btnText: "#666",
    dropBg: "#fff", dropShadow: "0 12px 40px rgba(0,0,0,0.12)", dropBorder: "rgba(0,0,0,0.06)",
    dropHover: "#f5f2ee", dropActiveFont: "#1a1a1a",
    footerBorder: "rgba(0,0,0,0.06)", footerText: "#bbb", footerSub: "#ccc",
    iconBg: "#f5f2ee", iconColor: "#1a1a1a",
    divider: "#ccc",
    mobilePillBg: "rgba(0,0,0,0.7)", mobilePillActive: "#fff", mobilePillActiveText: "#111", mobilePillText: "rgba(255,255,255,0.6)",
    overlayBg: "#111", overlayText: "#fff",
  },
  dark: {
    bg: "#111111", text: "#e8e8e8", textSoft: "#999", textMuted: "#777", textFaint: "#555", textUltra: "#444",
    cardBg: "#1c1c1c", cardBorder: "rgba(255,255,255,0.06)", cardShadow: "0 2px 16px rgba(0,0,0,0.3)",
    cardHoverBg: "#fff", cardHoverText: "#111", cardHoverSoft: "rgba(0,0,0,0.5)",
    navBg: "rgba(17,17,17,0.85)", navBorder: "rgba(255,255,255,0.06)",
    pillBg: "rgba(255,255,255,0.06)", pillActive: "#fff", pillActiveText: "#111", pillText: "#666",
    btnBorder: "rgba(255,255,255,0.12)", btnText: "#999",
    dropBg: "#1c1c1c", dropShadow: "0 12px 40px rgba(0,0,0,0.5)", dropBorder: "rgba(255,255,255,0.06)",
    dropHover: "#252525", dropActiveFont: "#fff",
    footerBorder: "rgba(255,255,255,0.06)", footerText: "#555", footerSub: "#444",
    iconBg: "#252525", iconColor: "#e8e8e8",
    divider: "#333",
    mobilePillBg: "rgba(255,255,255,0.1)", mobilePillActive: "#fff", mobilePillActiveText: "#111", mobilePillText: "rgba(255,255,255,0.5)",
    overlayBg: "#000", overlayText: "#fff",
  },
}

// ===== MONOCHROME SVG ICONS =====
const KitchenIcon = ({ size = 32, color = "#1a1a1a" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6" /><path d="M10 9h4" />
  </svg>
)
const LivingIcon = ({ size = 32, color = "#1a1a1a" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 16V10a2 2 0 012-2h16a2 2 0 012 2v6" /><path d="M2 16v2a2 2 0 002 2h16a2 2 0 002-2v-2" />
    <path d="M6 8V6a2 2 0 012-2h8a2 2 0 012 2v2" /><path d="M4 20v1M20 20v1" />
  </svg>
)
const GalleryIcon = ({ size = 32, color = "#1a1a1a" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
)
const CubeIcon = ({ size = 28, color = "#1a1a1a" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <path d="M3.27 6.96L12 12.01l8.73-5.05" /><path d="M12 22.08V12" />
  </svg>
)
const TouchIcon = ({ size = 28, color = "#1a1a1a" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 00-2-2 2 2 0 00-2 2" /><path d="M14 10V4a2 2 0 00-2-2 2 2 0 00-2 2v2" />
    <path d="M10 10.5V6a2 2 0 00-2-2 2 2 0 00-2 2v8" /><path d="M18 8a2 2 0 012 2v7.4a2 2 0 01-.6 1.4L15 23" />
    <path d="M6 14a2.587 2.587 0 01-.5-4" />
  </svg>
)
const CartIcon = ({ size = 28, color = "#1a1a1a" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h9.78a2 2 0 001.95-1.57l1.65-7.43H5.12" />
  </svg>
)
const SunIcon = ({ size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
)
const MoonIcon = ({ size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
)
const RoomIcon = ({ size = 32, color = "#1a1a1a" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21V8l9-5 9 5v13" /><path d="M9 21v-8h6v8" /><rect x="10" y="5" width="4" height="4" rx="0.5" />
  </svg>
)
const DiningIcon = ({ size = 32, color = "#1a1a1a" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 20h18" /><path d="M4 20v-4a2 2 0 012-2h12a2 2 0 012 2v4" />
    <path d="M12 14V4" /><path d="M8 4v4a4 4 0 008 0V4" />
  </svg>
)
const CozyLivingIcon = ({ size = 32, color = "#1a1a1a" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 18v-4a2 2 0 012-2h12a2 2 0 012 2v4" />
    <path d="M2 18h20v2H2z" /><path d="M6 12V8a2 2 0 012-2h8a2 2 0 012 2v4" />
    <path d="M2 14v4" /><path d="M22 14v4" />
  </svg>
)
const BathroomIcon = ({ size = 32, color = "#1a1a1a" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h16a1 1 0 011 1v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3a1 1 0 011-1z" />
    <path d="M6 12V5a2 2 0 012-2h1" />
    <path d="M18 20v2" /><path d="M6 20v2" />
    <circle cx="9" cy="8" r="0.5" fill={color} />
  </svg>
)

// ===== Scroll-triggered visibility hook =====
function useInView(ref, threshold = 0.2) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [ref, threshold])
  return visible
}

export function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const { lang, setLang } = useLang()
  const [langOpen, setLangOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [mobile, setMobile] = useState(checkMobile())
  const [activeSection, setActiveSection] = useState("home")
  const t = useTranslations()
  const { symbol } = useCurrency()
  const { theme, toggleTheme } = useTheme()
  const c = themes[theme]

  const heroRef = useRef(null)
  const aboutRef = useRef(null)
  const roomsRef = useRef(null)
  const galleryRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => { const timer = setTimeout(() => setLoaded(true), 100); return () => clearTimeout(timer) }, [])
  useEffect(() => { const r = () => setMobile(checkMobile()); window.addEventListener("resize", r); return () => window.removeEventListener("resize", r) }, [])

  useEffect(() => {
    if (!langOpen && !moreOpen) return
    const close = (e) => {
      if (!e.target.closest("[data-lang-home]")) setLangOpen(false)
      if (!e.target.closest("[data-more-menu]")) setMoreOpen(false)
    }
    setTimeout(() => document.addEventListener("click", close), 0)
    return () => document.removeEventListener("click", close)
  }, [langOpen, moreOpen])

  useEffect(() => { document.body.style.overflow = menuOpen ? "hidden" : ""; return () => { document.body.style.overflow = "" } }, [menuOpen])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const check = () => {
      const st = el.scrollTop + 200
      const bottom = el.scrollHeight - el.clientHeight
      // If scrolled near bottom, mark last section active
      if (el.scrollTop >= bottom - 50) setActiveSection("gallery")
      else if (galleryRef.current && st >= galleryRef.current.offsetTop) setActiveSection("gallery")
      else if (aboutRef.current && st >= aboutRef.current.offsetTop) setActiveSection("about")
      else setActiveSection("home")
    }
    el.addEventListener("scroll", check, { passive: true })
    return () => el.removeEventListener("scroll", check)
  }, [])

  const scrollTo = (ref) => { ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }) }

  const categories = [
    { icon: KitchenIcon, title: t.kitchen, desc: t.kitchenDesc, path: "/kuche" },
    { icon: LivingIcon, title: t.living, desc: t.livingDesc, path: "/wohnzimmer" },
    { icon: RoomIcon, title: t.room, desc: t.roomDesc, path: "/room/1" },
    { icon: DiningIcon, title: t.dining, desc: t.diningDesc, path: "/dining" },
    { icon: CozyLivingIcon, title: t.cozyLiving, desc: t.cozyLivingDesc, path: "/cozy-living" },
    { icon: BathroomIcon, title: t.bathroom, desc: t.bathroomDesc, path: "/bathroom" },
  ]

  const navItems = [
    { id: "home", label: t.navHome, ref: heroRef },
    { id: "about", label: t.navAbout, ref: aboutRef },
    { id: "gallery", label: t.navGallery, ref: galleryRef },
  ]

  return (
    <div ref={scrollRef} style={{
      position: "fixed", inset: 0, background: c.bg, overflow: "auto",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      WebkitFontSmoothing: "antialiased", scrollBehavior: "smooth",
      transition: "background 0.4s ease",
    }}>

      {/* ===== TOP BAR ===== */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 300,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: mobile ? "14px 20px" : "16px 48px",
        background: menuOpen ? "transparent" : c.navBg,
        backdropFilter: menuOpen ? "none" : "blur(20px)",
        WebkitBackdropFilter: menuOpen ? "none" : "blur(20px)",
        borderBottom: menuOpen ? "none" : `1px solid ${c.navBorder}`,
        transition: "all 0.4s ease",
        opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(-20px)",
        transitionDuration: "0.8s", transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <Link to="/" onClick={() => scrollTo(heroRef)} style={{
          textDecoration: "none", fontSize: mobile ? "18px" : "22px",
          fontWeight: 900, letterSpacing: "-0.5px",
          color: menuOpen ? "#fff" : c.text, transition: "color 0.4s ease",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <span style={{ fontSize: mobile ? "14px" : "16px" }}>✦</span> HAUSHALT
        </Link>

        {/* PILL NAV (center, desktop) */}
        {!mobile && !menuOpen && (
          <div style={{
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: "4px", background: c.pillBg, borderRadius: "24px", padding: "4px",
          }}>
            {navItems.map((item) => (
              <button key={item.id} onClick={() => scrollTo(item.ref)} style={{
                background: activeSection === item.id ? c.pillActive : "transparent",
                color: activeSection === item.id ? c.pillActiveText : c.pillText,
                border: "none", borderRadius: "20px", padding: "6px 16px",
                fontSize: "11px", fontWeight: 600, letterSpacing: "0.5px",
                cursor: "pointer", transition: "all 0.3s ease", whiteSpace: "nowrap",
              }}>
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Desktop right: Theme + Mehr + Lang */}
        {!mobile && (
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button onClick={toggleTheme} style={{
              background: "none", border: `1px solid ${c.btnBorder}`, borderRadius: "20px",
              padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
              transition: "all 0.3s ease", color: c.btnText,
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.text; e.currentTarget.style.color = c.text }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = c.btnBorder; e.currentTarget.style.color = c.btnText }}
              title={theme === "light" ? t.darkMode : t.lightMode}
            >
              {theme === "light" ? <MoonIcon size={14} color="currentColor" /> : <SunIcon size={14} color="currentColor" />}
            </button>

            <div style={{ position: "relative" }} data-more-menu>
              <button onClick={(e) => { e.stopPropagation(); setMoreOpen(!moreOpen); setLangOpen(false) }} style={{
                background: "none", border: `1px solid ${c.btnBorder}`, borderRadius: "20px",
                padding: "6px 16px", fontSize: "12px", fontWeight: 600, letterSpacing: "1.5px",
                textTransform: "uppercase", color: moreOpen ? c.text : c.btnText, cursor: "pointer",
                display: "flex", alignItems: "center", gap: "8px", transition: "all 0.3s ease",
                borderColor: moreOpen ? c.text : c.btnBorder,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.text; e.currentTarget.style.color = c.text }}
                onMouseLeave={(e) => { if (!moreOpen) { e.currentTarget.style.borderColor = c.btnBorder; e.currentTarget.style.color = c.btnText } }}
              >
                {t.more} <span style={{ fontSize: "8px", transition: "transform 0.3s", transform: moreOpen ? "rotate(180deg)" : "none" }}>▼</span>
              </button>
              {moreOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: c.dropBg, borderRadius: "12px", boxShadow: c.dropShadow,
                  border: `1px solid ${c.dropBorder}`, overflow: "hidden", minWidth: "200px",
                  animation: "fadeIn 0.2s ease",
                }}>
                  {categories.map((cat) => (
                    <Link key={cat.path} to={cat.path} onClick={() => setMoreOpen(false)} style={{
                      display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px",
                      textDecoration: "none", color: c.dropActiveFont, fontSize: "13px", fontWeight: 600,
                      transition: "background 0.2s", borderBottom: `1px solid ${c.dropBorder}`,
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = c.dropHover}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <cat.icon size={18} color={c.dropActiveFont} />{cat.title}
                    </Link>
                  ))}
                  <Link to="/galerie" onClick={() => setMoreOpen(false)} style={{
                    display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px",
                    textDecoration: "none", color: c.dropActiveFont, fontSize: "13px", fontWeight: 600,
                    transition: "background 0.2s", borderBottom: `1px solid ${c.dropBorder}`,
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = c.dropHover}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <GalleryIcon size={18} color={c.dropActiveFont} />{t.gallery}
                  </Link>
                  <button onClick={() => { setMoreOpen(false); setTimeout(() => document.getElementById("impressum-modal")?.showModal(), 100) }} style={{
                    display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px",
                    width: "100%", textAlign: "left", background: "transparent",
                    color: c.textMuted, fontSize: "12px", fontWeight: 500, cursor: "pointer",
                    border: "none", borderBottom: `1px solid ${c.dropBorder}`,
                    fontFamily: "'Inter','Segoe UI',sans-serif", transition: "background 0.2s",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = c.dropHover}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >{t.impressum}</button>
                  <button onClick={() => { setMoreOpen(false); setTimeout(() => document.getElementById("datenschutz-modal")?.showModal(), 100) }} style={{
                    display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px",
                    width: "100%", textAlign: "left", background: "transparent",
                    color: c.textMuted, fontSize: "12px", fontWeight: 500, cursor: "pointer",
                    border: "none", fontFamily: "'Inter','Segoe UI',sans-serif", transition: "background 0.2s",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = c.dropHover}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >{t.datenschutz}</button>
                </div>
              )}
            </div>

            <div style={{ position: "relative" }} data-lang-home>
              <button onClick={(e) => { e.stopPropagation(); setLangOpen(!langOpen); setMoreOpen(false) }} style={{
                background: "none", border: `1px solid ${c.btnBorder}`, borderRadius: "20px",
                padding: "6px 14px", fontSize: "12px", fontWeight: 600, letterSpacing: "0.5px",
                color: c.btnText, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                transition: "all 0.3s ease",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.text; e.currentTarget.style.color = c.text }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = c.btnBorder; e.currentTarget.style.color = c.btnText }}
              >
                {langFlags[lang]}
                <span style={{ fontSize: "8px", transition: "transform 0.3s", transform: langOpen ? "rotate(180deg)" : "none" }}>▼</span>
              </button>
              {langOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: c.dropBg, borderRadius: "12px", boxShadow: c.dropShadow,
                  border: `1px solid ${c.dropBorder}`, overflow: "hidden", minWidth: "140px",
                  animation: "fadeIn 0.2s ease",
                }}>
                  {Object.keys(langLabels).map((key) => (
                    <button key={key} onClick={() => { setLang(key); setLangOpen(false) }} style={{
                      display: "block", width: "100%", padding: "10px 16px",
                      background: lang === key ? c.dropHover : "transparent",
                      border: "none", cursor: "pointer", fontSize: "13px",
                      fontWeight: lang === key ? 700 : 500, color: c.dropActiveFont, textAlign: "left",
                      transition: "background 0.2s", fontFamily: "'Inter','Segoe UI',sans-serif",
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = c.dropHover}
                      onMouseLeave={(e) => e.currentTarget.style.background = lang === key ? c.dropHover : "transparent"}
                    >
                      <span style={{ marginRight: "8px", fontWeight: 700, fontSize: "11px", color: c.textMuted }}>{langFlags[key]}</span>
                      {langLabels[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile: Theme + Lang + Hamburger */}
        {mobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", zIndex: 301 }}>
            <button onClick={toggleTheme} style={{
              background: menuOpen ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
              border: menuOpen ? "1px solid rgba(255,255,255,0.2)" : `1px solid ${c.btnBorder}`,
              borderRadius: "20px", padding: "6px 10px", cursor: "pointer",
              display: "flex", alignItems: "center", transition: "all 0.4s ease",
              WebkitTapHighlightColor: "transparent",
            }}>
              {theme === "light"
                ? <MoonIcon size={13} color={menuOpen ? "#fff" : c.btnText} />
                : <SunIcon size={13} color={menuOpen ? "#fff" : c.btnText} />}
            </button>
            <div style={{ position: "relative" }} data-lang-home>
              <button onClick={(e) => { e.stopPropagation(); setLangOpen(!langOpen) }} style={{
                background: menuOpen ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                border: menuOpen ? "1px solid rgba(255,255,255,0.2)" : `1px solid ${c.btnBorder}`,
                borderRadius: "20px", padding: "6px 12px", fontSize: "11px", fontWeight: 700,
                color: menuOpen ? "#fff" : c.btnText, cursor: "pointer",
                display: "flex", alignItems: "center", gap: "5px",
                transition: "all 0.4s ease", WebkitTapHighlightColor: "transparent",
              }}>
                {langFlags[lang]}
                <span style={{ fontSize: "7px", transition: "transform 0.3s", transform: langOpen ? "rotate(180deg)" : "none" }}>▼</span>
              </button>
              {langOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: menuOpen ? "rgba(30,30,30,0.95)" : c.dropBg, borderRadius: "12px",
                  boxShadow: menuOpen ? "0 12px 40px rgba(0,0,0,0.5)" : c.dropShadow,
                  border: menuOpen ? "1px solid rgba(255,255,255,0.1)" : `1px solid ${c.dropBorder}`,
                  overflow: "hidden", minWidth: "130px", animation: "fadeIn 0.2s ease", zIndex: 400,
                }}>
                  {Object.keys(langLabels).map((key) => (
                    <button key={key} onClick={() => { setLang(key); setLangOpen(false) }} style={{
                      display: "block", width: "100%", padding: "10px 14px",
                      background: lang === key ? (menuOpen ? "rgba(255,255,255,0.1)" : c.dropHover) : "transparent",
                      border: "none", cursor: "pointer", fontSize: "12px",
                      fontWeight: lang === key ? 700 : 500,
                      color: menuOpen ? "#fff" : c.dropActiveFont, textAlign: "left",
                      transition: "background 0.2s", WebkitTapHighlightColor: "transparent",
                      fontFamily: "'Inter','Segoe UI',sans-serif",
                    }}>
                      <span style={{ marginRight: "6px", fontWeight: 700, fontSize: "10px", opacity: 0.5 }}>{langFlags[key]}</span>
                      {langLabels[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => { setMenuOpen(!menuOpen); setLangOpen(false) }} aria-label="Menu" style={{
              background: "none", border: "none", cursor: "pointer", padding: "8px",
              display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
              width: "36px", height: "36px", WebkitTapHighlightColor: "transparent",
            }}>
              <span style={{ display: "block", width: "24px", height: "2px", background: menuOpen ? "#fff" : c.text,
                borderRadius: "2px", transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                transform: menuOpen ? "rotate(45deg) translateY(0px)" : "translateY(-4px)" }} />
              <span style={{ display: "block", width: "24px", height: "2px", background: menuOpen ? "#fff" : c.text,
                borderRadius: "2px", transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                transform: menuOpen ? "rotate(-45deg) translateY(0px)" : "translateY(4px)" }} />
            </button>
          </div>
        )}
      </nav>

      {/* ===== MOBILE PILL NAV (bottom) ===== */}
      {mobile && !menuOpen && (
        <div style={{
          position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: "4px", zIndex: 200,
          background: c.mobilePillBg, borderRadius: "24px", padding: "4px",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        }}>
          {navItems.map((item) => (
            <button key={item.id} onClick={() => scrollTo(item.ref)} style={{
              background: activeSection === item.id ? c.mobilePillActive : "transparent",
              color: activeSection === item.id ? c.mobilePillActiveText : c.mobilePillText,
              border: "none", borderRadius: "20px", padding: "6px 12px",
              fontSize: "9px", fontWeight: 600, letterSpacing: "0.5px",
              cursor: "pointer", transition: "all 0.3s ease", whiteSpace: "nowrap",
              WebkitTapHighlightColor: "transparent",
            }}>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* ===== MOBILE FULLSCREEN OVERLAY ===== */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 250, background: c.overlayBg,
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "all" : "none",
        transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        {[...categories, { icon: GalleryIcon, title: t.gallery, path: "/galerie" }].map((cat, i) => (
          <Link key={cat.path} to={cat.path} onClick={() => setMenuOpen(false)} style={{
            textDecoration: "none", color: c.overlayText,
            fontSize: "clamp(28px, 8vw, 42px)", fontWeight: 700, letterSpacing: "-0.5px",
            padding: "20px 0",
            opacity: menuOpen ? 1 : 0,
            transform: menuOpen ? "translateY(0)" : `translateY(${30 + i * 15}px)`,
            transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 + i * 0.1}s`,
            WebkitTapHighlightColor: "transparent",
          }}>
            {cat.title}
          </Link>
        ))}
        <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.15)", margin: "12px 0" }} />
        <div style={{ opacity: menuOpen ? 1 : 0, transition: "opacity 0.6s ease 0.6s", display: "flex", gap: 20 }}>
          <button onClick={() => { setMenuOpen(false); setTimeout(() => document.getElementById("impressum-modal")?.showModal(), 100) }}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter','Segoe UI',sans-serif", WebkitTapHighlightColor: "transparent" }}>
            {t.impressum}
          </button>
          <button onClick={() => { setMenuOpen(false); setTimeout(() => document.getElementById("datenschutz-modal")?.showModal(), 100) }}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter','Segoe UI',sans-serif", WebkitTapHighlightColor: "transparent" }}>
            {t.datenschutz}
          </button>
        </div>
      </div>

      {/* ===== HERO ===== */}
      <div ref={heroRef} style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: mobile ? "100px 28px 40px" : "140px 48px 60px", textAlign: "center",
      }}>
        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(40px)", transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s" }}>
          <div style={{ fontSize: "clamp(11px, 2.5vw, 13px)", fontWeight: 600, letterSpacing: "4px", textTransform: "uppercase", color: c.textMuted, marginBottom: "20px" }}>
            ✦ {t.welcome}
          </div>
          <h1 style={{ fontSize: "clamp(52px, 14vw, 130px)", fontWeight: 900, letterSpacing: "-3px", color: c.text, margin: 0, lineHeight: 0.9, transition: "color 0.4s ease" }}>
            Haushalt
          </h1>
        </div>
        <p style={{ fontSize: "clamp(14px, 3.5vw, 18px)", color: c.textSoft, maxWidth: "500px", lineHeight: 1.7, margin: "36px auto 0", padding: "0 8px", opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(30px)", transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s" }}>
          {t.tagline}
        </p>
        <div style={{ width: "40px", height: "1.5px", background: c.divider, margin: "44px 0", opacity: loaded ? 1 : 0, transition: "opacity 1.2s ease 0.7s" }} />
        <div style={{ display: "flex", gap: mobile ? "32px" : "64px", opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)", transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.8s" }}>
          {[{ num: "3D", label: t.stat1 }, { num: "100%", label: t.stat2 }, { num: symbol, label: t.stat3 }].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(24px, 6vw, 34px)", fontWeight: 800, color: c.text }}>{s.num}</div>
              <div style={{ fontSize: "clamp(9px, 2.2vw, 11px)", color: c.textFaint, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginTop: "6px" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 48, opacity: loaded ? 0.4 : 0, transition: "opacity 1.5s ease 1.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: 1, height: 32, background: `linear-gradient(to bottom, ${c.divider}, transparent)` }} />
        </div>
      </div>

      {/* ===== ABOUT ===== */}
      <AboutSection ref={aboutRef} t={t} mobile={mobile} />

      {/* ===== ROOMS ===== */}
      <div ref={roomsRef} style={{ padding: mobile ? "60px 20px 40px" : "80px 48px 60px", maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: mobile ? "28px" : "48px" }}>
          <div style={{ fontSize: "clamp(10px, 2.2vw, 12px)", fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", color: c.textFaint, marginBottom: "12px" }}>{t.rooms}</div>
          <div style={{ fontSize: "clamp(26px, 6.5vw, 38px)", fontWeight: 800, color: c.text, letterSpacing: "-0.5px" }}>{t.chooseRoom}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(2, 1fr)", gap: mobile ? "16px" : "24px" }}>
          {categories.map((cat, i) => (
            <CategoryCard key={cat.path} cat={cat} index={i} loaded={loaded} mobile={mobile} exploreText={t.discover} c={c} />
          ))}
        </div>
        {/* Gallery button under room cards */}
        <div style={{ textAlign: "center", marginTop: mobile ? 24 : 36 }}>
          <Link to="/galerie" style={{
            display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none",
            background: c.cardBg, border: `1px solid ${c.cardBorder}`, borderRadius: mobile ? 14 : 16,
            padding: mobile ? "16px 28px" : "18px 36px", color: c.text,
            fontSize: mobile ? 14 : 15, fontWeight: 700, letterSpacing: "-0.2px",
            boxShadow: c.cardShadow, transition: "all 0.3s ease",
          }}>
            <GalleryIcon size={20} color={c.text} /> {t.gallery} →
          </Link>
        </div>
      </div>

      {/* Gallery anchor for pill nav */}
      <div ref={galleryRef} />

      {/* ===== FOOTER ===== */}
      <footer style={{
        padding: mobile ? "32px 20px 80px" : "40px 48px", borderTop: `1px solid ${c.footerBorder}`,
        display: "flex", flexDirection: "column", alignItems: "center", gap: "20px",
      }}>
        <div style={{ color: c.footerText, fontSize: "12px", fontWeight: 500 }}>© 2026 Haushalt. {t.rights}. David Ionathan Simko</div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => document.getElementById("impressum-modal")?.showModal()} style={{
            background: c.cardBg, border: `1px solid ${c.cardBorder}`, borderRadius: "20px",
            padding: "8px 20px", fontSize: "12px", fontWeight: 600, color: c.textSoft,
            cursor: "pointer", transition: "all 0.3s ease", fontFamily: "'Inter','Segoe UI',sans-serif",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.text; e.currentTarget.style.color = c.text }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = c.cardBorder; e.currentTarget.style.color = c.textSoft }}
          >{t.impressum}</button>
          <button onClick={() => document.getElementById("datenschutz-modal")?.showModal()} style={{
            background: c.cardBg, border: `1px solid ${c.cardBorder}`, borderRadius: "20px",
            padding: "8px 20px", fontSize: "12px", fontWeight: 600, color: c.textSoft,
            cursor: "pointer", transition: "all 0.3s ease", fontFamily: "'Inter','Segoe UI',sans-serif",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.text; e.currentTarget.style.color = c.text }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = c.cardBorder; e.currentTarget.style.color = c.textSoft }}
          >{t.datenschutz}</button>
        </div>
        <div style={{ color: c.footerSub, fontSize: "11px", fontWeight: 400, textAlign: "center", maxWidth: 400 }}>{t.projectNote}</div>
        <div style={{ color: c.footerSub, fontSize: "11px", fontWeight: 400 }}>{t.quality} ✦</div>
      </footer>

      {/* ===== IMPRESSUM MODAL ===== */}
      <dialog id="impressum-modal" onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close() }} style={{
        position: "fixed", inset: 0, margin: "auto", maxWidth: mobile ? "90vw" : "560px",
        maxHeight: "80vh", background: c.cardBg, color: c.text, border: `1px solid ${c.cardBorder}`,
        borderRadius: mobile ? 16 : 20, padding: mobile ? "28px 24px" : "40px 36px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.3)", overflow: "auto",
        fontFamily: "'Inter','Segoe UI',sans-serif",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: "clamp(10px, 2.2vw, 12px)", fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", color: c.textFaint }}>{t.impressumTitle}</div>
          <button onClick={() => document.getElementById("impressum-modal")?.close()} style={{
            background: "none", border: "none", fontSize: 20, color: c.textMuted, cursor: "pointer",
            fontFamily: "'Inter','Segoe UI',sans-serif", padding: "4px 8px",
          }}>✕</button>
        </div>
        <p style={{ fontSize: mobile ? 13 : 14, lineHeight: 1.8, color: c.textSoft, margin: 0 }}>{t.impressumText}</p>
      </dialog>

      {/* ===== DATENSCHUTZ MODAL ===== */}
      <dialog id="datenschutz-modal" onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close() }} style={{
        position: "fixed", inset: 0, margin: "auto", maxWidth: mobile ? "90vw" : "560px",
        maxHeight: "80vh", background: c.cardBg, color: c.text, border: `1px solid ${c.cardBorder}`,
        borderRadius: mobile ? 16 : 20, padding: mobile ? "28px 24px" : "40px 36px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.3)", overflow: "auto",
        fontFamily: "'Inter','Segoe UI',sans-serif",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: "clamp(10px, 2.2vw, 12px)", fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", color: c.textFaint }}>{t.datenschutzTitle}</div>
          <button onClick={() => document.getElementById("datenschutz-modal")?.close()} style={{
            background: "none", border: "none", fontSize: 20, color: c.textMuted, cursor: "pointer",
            fontFamily: "'Inter','Segoe UI',sans-serif", padding: "4px 8px",
          }}>✕</button>
        </div>
        <p style={{ fontSize: mobile ? 13 : 14, lineHeight: 1.8, color: c.textSoft, margin: 0 }}>{t.datenschutzText}</p>
      </dialog>
    </div>
  )
}

// ===== ABOUT SECTION =====
const AboutSection = forwardRef(function AboutSection({ t, mobile }, ref) {
  const sectionRef = useRef(null)
  const visible = useInView(sectionRef, 0.15)
  const features = [
    { icon: CubeIcon, title: t.feature1Title, desc: t.feature1Desc },
    { icon: TouchIcon, title: t.feature2Title, desc: t.feature2Desc },
    { icon: CartIcon, title: t.feature3Title, desc: t.feature3Desc },
  ]
  return (
    <div ref={(el) => { sectionRef.current = el; if (typeof ref === "function") ref(el); else if (ref) ref.current = el }} style={{
      padding: mobile ? "60px 20px" : "100px 48px", background: "#1a1a1a", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div style={{ maxWidth: 960, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: mobile ? 40 : 64, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div style={{ fontSize: "clamp(10px, 2.2vw, 12px)", fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>✦ Haushalt</div>
          <h2 style={{ fontSize: "clamp(28px, 7vw, 48px)", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-1px", lineHeight: 1.1 }}>{t.aboutTitle}</h2>
          <p style={{ fontSize: "clamp(14px, 3.2vw, 17px)", color: "rgba(255,255,255,0.5)", maxWidth: 520, margin: "20px auto 0", lineHeight: 1.7 }}>{t.aboutDesc}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: mobile ? 16 : 24 }}>
          {features.map((feat, i) => <FeatureCard key={i} feat={feat} index={i} visible={visible} mobile={mobile} />)}
        </div>
      </div>
    </div>
  )
})

function FeatureCard({ feat, index, visible, mobile }) {
  const [hover, setHover] = useState(false)
  const IconComp = feat.icon
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: hover ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)", borderRadius: mobile ? 16 : 20,
      padding: mobile ? "28px 24px" : "36px 32px", opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(30px)",
      transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 + index * 0.12}s, background 0.3s ease`,
      cursor: "default",
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: hover ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, transition: "background 0.3s ease" }}>
        <IconComp size={22} color={hover ? "#fff" : "rgba(255,255,255,0.6)"} />
      </div>
      <div style={{ fontSize: mobile ? 16 : 17, fontWeight: 700, color: "#fff", marginBottom: 8, letterSpacing: "-0.3px" }}>{feat.title}</div>
      <div style={{ fontSize: mobile ? 13 : 14, lineHeight: 1.6, color: "rgba(255,255,255,0.45)" }}>{feat.desc}</div>
    </div>
  )
}

function CategoryCard({ cat, index, loaded, mobile, exploreText, c }) {
  const [hover, setHover] = useState(false)
  const IconComponent = cat.icon
  return (
    <Link to={cat.path} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      textDecoration: "none", background: hover ? c.cardHoverBg : c.cardBg,
      borderRadius: mobile ? "16px" : "20px", padding: mobile ? "28px 24px" : "40px 36px",
      border: `1px solid ${c.cardBorder}`, boxShadow: hover ? "0 24px 64px rgba(0,0,0,0.12)" : c.cardShadow,
      transform: loaded ? hover ? "translateY(-6px)" : "translateY(0)" : "translateY(30px)",
      opacity: loaded ? 1 : 0,
      transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${1.1 + index * 0.15}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${1.1 + index * 0.15}s, background 0.4s ease, box-shadow 0.4s ease`,
      cursor: "pointer", display: "flex", flexDirection: "row", alignItems: "center",
      gap: mobile ? "20px" : "28px", WebkitTapHighlightColor: "transparent",
    }}>
      <div style={{ width: mobile ? "52px" : "64px", height: mobile ? "52px" : "64px", borderRadius: "16px", background: hover ? "rgba(255,255,255,0.1)" : c.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.4s ease" }}>
        <IconComponent size={mobile ? 24 : 28} color={hover ? c.cardHoverText : c.iconColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: mobile ? "18px" : "20px", fontWeight: 800, color: hover ? c.cardHoverText : c.text, transition: "color 0.4s ease", marginBottom: "4px" }}>{cat.title}</div>
        <div style={{ fontSize: mobile ? "12px" : "13px", lineHeight: 1.5, color: hover ? c.cardHoverSoft : c.textMuted, transition: "color 0.4s ease" }}>{cat.desc}</div>
      </div>
      <div style={{ fontSize: "18px", color: hover ? c.cardHoverText : c.textUltra, transition: "all 0.4s ease", transform: hover ? "translateX(4px)" : "translateX(0)", flexShrink: 0 }}>→</div>
    </Link>
  )
}