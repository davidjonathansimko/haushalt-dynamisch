import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useLang, useTranslations, useCurrency, itemNames, langFlags, langLabels } from "./i18n"
import { isMobile as checkMobile } from "./shared"
import { useCart, cartTotal, cartCount } from "./CartContext"

export function SceneOverlay({ items, hovered, roomId = "default" }) {
  const [listOpen, setListOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [showLocal, setShowLocal] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [mobile, setMobile] = useState(checkMobile())
  const [landscape, setLandscape] = useState(false)
  const [cameraMode, setCameraMode] = useState(false)
  const storageKey = `haushalt-camera-${roomId}`
  const [cameraSaved, setCameraSaved] = useState(() => !!localStorage.getItem(storageKey))
  const navigate = useNavigate()
  const t = useTranslations()
  const { lang, setLang } = useLang()
  const { symbol, rate, code } = useCurrency()
  const { cart, dispatch } = useCart()

  useEffect(() => {
    const r = () => {
      setMobile(checkMobile())
      setLandscape(checkMobile() && window.innerWidth > window.innerHeight)
    }
    r()
    window.addEventListener("resize", r)
    window.addEventListener("orientationchange", () => setTimeout(r, 200))
    return () => {
      window.removeEventListener("resize", r)
      window.removeEventListener("orientationchange", r)
    }
  }, [])

  // Broadcast list open state so RotateHint can hide
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("list-open", { detail: listOpen }))
  }, [listOpen])

  // Listen for camera-saved event to update saved state
  useEffect(() => {
    const onSaved = () => setCameraSaved(!!localStorage.getItem(storageKey))
    window.addEventListener("camera-saved", onSaved)
    return () => window.removeEventListener("camera-saved", onSaved)
  }, [storageKey])

  // Toggle camera control mode
  const toggleCameraMode = () => {
    const next = !cameraMode
    setCameraMode(next)
    window.dispatchEvent(new CustomEvent("camera-control-mode", { detail: next }))
  }
  const saveCamera = () => {
    window.dispatchEvent(new CustomEvent("camera-save"))
    setCameraMode(false)
    window.dispatchEvent(new CustomEvent("camera-control-mode", { detail: false }))
  }
  const resetCamera = () => {
    window.dispatchEvent(new CustomEvent("camera-reset"))
    setCameraMode(false)
    window.dispatchEvent(new CustomEvent("camera-control-mode", { detail: false }))
  }

  // Close lang dropdown on outside click
  useEffect(() => {
    if (!langOpen) return
    const close = (e) => {
      if (!e.target.closest("[data-lang-menu]")) setLangOpen(false)
    }
    setTimeout(() => document.addEventListener("click", close), 0)
    return () => document.removeEventListener("click", close)
  }, [langOpen])

  const getLocalName = (key) => itemNames[lang]?.[key] || key
  const fmtNum = (n) => n.toLocaleString(lang === "de" ? "de-DE" : lang === "ro" ? "ro-RO" : lang === "ru" ? "ru-RU" : "en-US")
  const fmtEur = (eur) => `€${eur.toLocaleString("de-DE")}`
  const fmtLocal = (eur) => {
    const val = Math.round(eur * rate)
    if (lang === "ro" || lang === "ru") return `${fmtNum(val)} ${symbol}`
    return `${symbol}${fmtNum(val)}`
  }
  const totalEur = items.reduce((sum, i) => sum + i.priceEur, 0)
  const isEurLang = lang === "de"
  const count = cartCount(cart)

  const addItem = (item) => {
    dispatch({ type: "ADD", item: { name: item.key, priceEur: item.priceEur } })
  }

  // Click item in list → dispatch event to select it in 3D, close list
  const selectItem = (key) => {
    setListOpen(false)
    window.dispatchEvent(new CustomEvent("scene-hover", { detail: key }))
    window.dispatchEvent(new CustomEvent("overlay-select", { detail: key }))
  }

  const btnBase = {
    display: "flex", alignItems: "center", gap: "8px",
    border: "none", borderRadius: "28px",
    fontSize: mobile ? "12px" : "13px", fontWeight: 600,
    fontFamily: "'Inter','Segoe UI',sans-serif",
    letterSpacing: "0.5px", cursor: "pointer",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    transition: "all 0.3s ease",
    WebkitTapHighlightColor: "transparent",
  }

  return (
    <>
      {/* ===== BACK BUTTON — top left ===== */}
      <button
        onClick={() => navigate("/")}
        style={{
          ...btnBase,
          position: "fixed", top: mobile ? 14 : 20, left: mobile ? 14 : 24, zIndex: 1000,
          background: "rgba(0,0,0,0.6)", color: "#fff",
          padding: mobile ? "10px 18px" : "10px 22px",
        }}
      >
        <span style={{ fontSize: "16px" }}>←</span>
        {t.back}
      </button>

      {/* ===== TOP RIGHT: LANG + LIST BUTTONS ===== */}
      <div style={{
        position: "fixed", top: mobile ? 14 : 20, right: mobile ? 14 : 24, zIndex: 1000,
        display: "flex", gap: "8px", alignItems: "center",
      }}>
        {/* Lang button + dropdown */}
        <div style={{ position: "relative" }} data-lang-menu>
          <button
            onClick={(e) => { e.stopPropagation(); setLangOpen(!langOpen) }}
            style={{
              ...btnBase,
              background: langOpen ? "#fff" : "rgba(0,0,0,0.6)",
              color: langOpen ? "#111" : "#fff",
              padding: mobile ? "10px 14px" : "10px 18px",
            }}
          >
            {langFlags[lang]}
            <span style={{ fontSize: "8px", transition: "transform 0.3s", transform: langOpen ? "rotate(180deg)" : "none" }}>▼</span>
          </button>
          {langOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              background: "rgba(15,15,15,0.95)", borderRadius: "14px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.1)",
              overflow: "hidden", minWidth: "150px",
              backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              animation: "fadeIn 0.2s ease",
            }}>
              {Object.keys(langFlags).map((key) => (
                <button key={key} onClick={() => { setLang(key); setLangOpen(false); setShowLocal(false) }} style={{
                  display: "flex", width: "100%", padding: "11px 16px",
                  background: lang === key ? "rgba(255,255,255,0.1)" : "transparent",
                  border: "none", cursor: "pointer", alignItems: "center", gap: "10px",
                  fontSize: "13px", fontWeight: lang === key ? 700 : 500,
                  color: lang === key ? "#fff" : "rgba(255,255,255,0.6)",
                  textAlign: "left", transition: "background 0.2s",
                  fontFamily: "'Inter','Segoe UI',sans-serif",
                }}>
                  <span style={{ fontWeight: 700, fontSize: "11px", opacity: 0.5 }}>{langFlags[key]}</span>
                  {langLabels[key]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* List button */}
        <button
          onClick={() => { setListOpen(!listOpen); setCartOpen(false) }}
          style={{
            ...btnBase,
            background: listOpen ? "#fff" : "rgba(0,0,0,0.6)",
            color: listOpen ? "#111" : "#fff",
            padding: mobile ? "10px 18px" : "10px 22px",
          }}
        >
          {listOpen ? "✕" : "☰"} {listOpen ? t.close : t.list}
        </button>

        {/* Cart button */}
        <button
          onClick={() => { setCartOpen(!cartOpen); setListOpen(false) }}
          style={{
            ...btnBase,
            position: "relative",
            background: cartOpen ? "#fff" : "rgba(0,0,0,0.6)",
            color: cartOpen ? "#111" : "#fff",
            padding: mobile ? "10px 14px" : "10px 18px",
          }}
        >
          🛒
          {count > 0 && (
            <span style={{
              position: "absolute", top: -4, right: -4,
              width: 18, height: 18, borderRadius: "50%",
              background: "#e74c3c", color: "#fff",
              fontSize: "10px", fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "fadeIn 0.2s ease",
            }}>
              {count}
            </span>
          )}
        </button>

        {/* Camera control (crosshair) button */}
        {!mobile && (
          <button
            onClick={toggleCameraMode}
            title="Camera Control"
            style={{
              ...btnBase,
              background: cameraMode ? "#fff" : "rgba(0,0,0,0.6)",
              color: cameraMode ? "#111" : "#fff",
              padding: "10px 16px",
              fontSize: "16px",
              lineHeight: 1,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="2" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="22" y2="12" />
            </svg>
          </button>
        )}
      </div>

      {/* ===== PRICE LIST PANEL ===== */}
      <div style={{
        position: "fixed",
        ...(mobile && landscape ? {
          // Mobile landscape: horizontal panel from bottom
          left: 0, right: 0, bottom: 0,
          height: "50vh",
          width: "100%",
          transform: listOpen ? "translateY(0)" : "translateY(100%)",
        } : {
          // Desktop / mobile portrait: right panel
          top: 0, right: 0, bottom: 0,
          width: mobile ? "100%" : "30%",
          minWidth: mobile ? undefined : "340px",
          maxWidth: mobile ? undefined : "440px",
          transform: listOpen ? "translateX(0)" : "translateX(100%)",
        }),
        zIndex: 900,
        background: mobile ? "rgba(10,10,10,0.97)" : "rgba(15,15,15,0.92)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        transition: mobile && landscape
          ? "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
          : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
        flexDirection: mobile && landscape ? "column" : "column",
        fontFamily: "'Inter','Segoe UI',sans-serif",
        overflow: "auto",
      }}>
        {/* Panel Header */}
        <div style={{
          padding: mobile && landscape ? "12px 20px 8px" : mobile ? "72px 24px 16px" : "80px 28px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: mobile && landscape ? "flex" : "block",
          alignItems: "center", gap: "16px",
          flexShrink: 0,
        }}>
          <div style={{
            fontSize: mobile ? "10px" : "11px",
            fontWeight: 600, letterSpacing: "2.5px", textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)", marginBottom: mobile && landscape ? 0 : "8px",
          }}>
            {t.priceList}
          </div>
          {!isEurLang && (
            <button
              onClick={() => setShowLocal(!showLocal)}
              style={{
                background: showLocal ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px", padding: "8px 14px",
                color: showLocal ? "#fff" : "rgba(255,255,255,0.5)",
                fontSize: "11px", fontWeight: 600, cursor: "pointer",
                fontFamily: "'Inter','Segoe UI',sans-serif",
                transition: "all 0.3s ease", marginTop: "4px",
              }}
            >
              {showLocal ? `✓ ${code} (1€ = ${rate.toFixed(2)} ${symbol})` : t.switchCurrency}
            </button>
          )}
        </div>

        {/* Items — clickable */}
        <div style={{
          flex: 1, padding: mobile ? "8px 12px" : "8px 16px",
          overflowY: "auto",
          ...(mobile && landscape ? {
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "2px",
            padding: "4px 12px",
          } : {}),
        }}>
          {items.map((item) => {
            const isActive = hovered === item.key
            return (
              <button
                key={item.key}
                onClick={() => selectItem(item.key)}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  width: "100%", textAlign: "left",
                  padding: mobile && landscape ? "8px 10px" : mobile ? "14px 12px" : "12px 12px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                  borderRadius: isActive ? "10px" : "0",
                  border: "none", cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontFamily: "'Inter','Segoe UI',sans-serif",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: isActive ? "#fff" : "rgba(255,255,255,0.15)",
                    flexShrink: 0, transition: "all 0.3s",
                  }} />
                  <span style={{
                    fontSize: mobile ? "14px" : "13px",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                    letterSpacing: "0.5px", transition: "all 0.3s",
                  }}>
                    {getLocalName(item.key)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{
                    fontSize: mobile ? "14px" : "13px", fontWeight: 700,
                    color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                    fontVariantNumeric: "tabular-nums", transition: "all 0.3s",
                  }}>
                    {fmtEur(item.priceEur)}
                  </span>
                  {showLocal && !isEurLang && (
                    <span style={{
                      fontSize: "11px", fontWeight: 500,
                      color: "rgba(255,255,255,0.3)",
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {fmtLocal(item.priceEur)}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); addItem(item) }}
                    style={{
                      marginLeft: 6, fontSize: "11px", fontWeight: 600, cursor: "pointer",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "6px", padding: "4px 10px",
                      color: "rgba(255,255,255,0.7)",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                      letterSpacing: "0.3px",
                      fontFamily: "'Inter','Segoe UI',sans-serif",
                      WebkitTapHighlightColor: "transparent",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)" }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)" }}
                    title={t.addToCart}
                  >
                    + {t.cart}
                  </button>
                </div>
              </button>
            )
          })}
        </div>

        {/* Total */}
        <div style={{
          padding: mobile && landscape ? "8px 20px" : mobile ? "14px 24px" : "12px 28px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
            Total
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: mobile ? "16px" : "15px", fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
              {fmtEur(totalEur)}
            </span>
            {showLocal && !isEurLang && (
              <span style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.35)", fontVariantNumeric: "tabular-nums" }}>
                {fmtLocal(totalEur)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ===== CART DRAWER ===== */}
      <div style={{
        position: "fixed",
        top: 0, right: 0, bottom: 0,
        width: mobile ? "100%" : "30%",
        minWidth: mobile ? undefined : "340px",
        maxWidth: mobile ? undefined : "440px",
        transform: cartOpen ? "translateX(0)" : "translateX(100%)",
        zIndex: 900,
        background: mobile ? "rgba(10,10,10,0.97)" : "rgba(15,15,15,0.92)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex", flexDirection: "column",
        fontFamily: "'Inter','Segoe UI',sans-serif",
        overflow: "auto",
      }}>
        <div style={{
          padding: mobile ? "72px 24px 16px" : "80px 28px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{
            fontSize: mobile ? "10px" : "11px", fontWeight: 600,
            letterSpacing: "2.5px", textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
          }}>
            🛒 {t.cart} ({count})
          </div>
          {cart.length > 0 && (
            <button onClick={() => dispatch({ type: "CLEAR" })} style={{
              background: "rgba(231,76,60,0.2)", border: "1px solid rgba(231,76,60,0.3)",
              borderRadius: 8, padding: "6px 12px", color: "#e74c3c",
              fontSize: 11, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Inter','Segoe UI',sans-serif",
              transition: "all 0.3s",
            }}>
              {t.clearCart}
            </button>
          )}
        </div>

        <div style={{ flex: 1, padding: mobile ? "8px 12px" : "8px 16px", overflowY: "auto" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
              {t.cartEmpty}
            </div>
          ) : cart.map((ci) => (
            <div key={ci.name} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: mobile ? "12px 10px" : "10px 10px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                  {getLocalName(ci.name)}
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>×{ci.qty}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                  {fmtEur(ci.priceEur * ci.qty)}
                </span>
                <button onClick={() => dispatch({ type: "DEC", name: ci.name })} style={{
                  background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 6,
                  width: 24, height: 24, color: "rgba(255,255,255,0.5)",
                  fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}>−</button>
                <button onClick={() => dispatch({ type: "ADD", item: { name: ci.name, priceEur: ci.priceEur } })} style={{
                  background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 6,
                  width: 24, height: 24, color: "rgba(255,255,255,0.5)",
                  fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}>+</button>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div style={{
            padding: mobile ? "14px 24px" : "12px 28px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
              {t.total}
            </span>
            <span style={{ fontSize: mobile ? 16 : 15, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
              {fmtEur(cartTotal(cart))}
            </span>
          </div>
        )}
      </div>

      {/* ===== CAMERA CONTROL CROSSHAIR OVERLAY ===== */}
      {cameraMode && (
        <>
          {/* Crosshair in center */}
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            zIndex: 1100, pointerEvents: "none",
          }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5">
              <circle cx="24" cy="24" r="10" strokeDasharray="4 3" />
              <line x1="24" y1="4" x2="24" y2="16" />
              <line x1="24" y1="32" x2="24" y2="44" />
              <line x1="4" y1="24" x2="16" y2="24" />
              <line x1="32" y1="24" x2="44" y2="24" />
              <circle cx="24" cy="24" r="2" fill="rgba(255,255,255,0.7)" stroke="none" />
            </svg>
          </div>

          {/* Instruction + Save/Reset bar at bottom */}
          <div style={{
            position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)",
            zIndex: 1100, display: "flex", alignItems: "center", gap: "12px",
            background: "rgba(0,0,0,0.75)", borderRadius: "28px",
            padding: "10px 20px",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            fontFamily: "'Inter','Segoe UI',sans-serif",
            animation: "fadeInUp 0.3s ease",
          }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontWeight: 500, whiteSpace: "nowrap" }}>
              🖱️ Drag 360° + Scroll Zoom
            </span>
            <button onClick={saveCamera} style={{
              ...btnBase,
              background: "rgba(46,204,113,0.8)", color: "#fff",
              padding: "8px 18px", fontSize: "12px",
            }}>
              ✓ Save
            </button>
            {cameraSaved && (
              <button onClick={resetCamera} style={{
                ...btnBase,
                background: "rgba(231,76,60,0.7)", color: "#fff",
                padding: "8px 18px", fontSize: "12px",
              }}>
                ✕ Reset
              </button>
            )}
            <button onClick={toggleCameraMode} style={{
              ...btnBase,
              background: "rgba(255,255,255,0.15)", color: "#fff",
              padding: "8px 18px", fontSize: "12px",
            }}>
              Cancel
            </button>
          </div>

          {/* Subtle border to indicate active mode */}
          <div style={{
            position: "fixed", inset: 0, zIndex: 1050,
            border: "2px solid rgba(255,255,255,0.2)",
            borderRadius: "0", pointerEvents: "none",
          }} />
        </>
      )}

      {/* Backdrop — click outside to close */}
      {(listOpen || cartOpen) && (
        <div
          onClick={() => { setListOpen(false); setCartOpen(false) }}
          style={{
            position: "fixed", inset: 0, zIndex: 850,
            background: mobile ? "rgba(0,0,0,0.5)" : "transparent",
          }}
        />
      )}
    </>
  )
}
