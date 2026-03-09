import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Suspense, lazy } from "react"

import { HomePage } from "./HomePage"
import { LangProvider } from "./i18n"
import { CartProvider } from "./CartContext"
import { AdminProvider } from "./AdminContext"
import "./style.css"

// Lazy-load 3D scene pages — they pull in Three.js, drei, postprocessing etc.
const App = lazy(() => import("./App").then(m => ({ default: m.App })))
const VegetablesApp = lazy(() => import("./VegetablesApp").then(m => ({ default: m.VegetablesApp })))
const GalleryPage = lazy(() => import("./GalleryPage").then(m => ({ default: m.GalleryPage })))
const RoomApp = lazy(() => import("./RoomApp").then(m => ({ default: m.RoomApp })))
const DiningApp = lazy(() => import("./DiningApp").then(m => ({ default: m.DiningApp })))
const CozyLivingApp = lazy(() => import("./CozyLivingApp").then(m => ({ default: m.CozyLivingApp })))
const BathroomApp = lazy(() => import("./BathroomApp").then(m => ({ default: m.BathroomApp })))
const RoomPlaceholder = lazy(() => import("./RoomPlaceholder").then(m => ({ default: m.RoomPlaceholder })))

function RouteFallback() {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#f5f2ee",
      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
      fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>
      {/* Skeleton header */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ width: 80, height: 14, borderRadius: 7, background: "#e8e4df", animation: "skeletonPulse 1.5s ease infinite" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 50, height: 32, borderRadius: 16, background: "#e8e4df", animation: "skeletonPulse 1.5s ease infinite 0.1s" }} />
          <div style={{ width: 70, height: 32, borderRadius: 16, background: "#e8e4df", animation: "skeletonPulse 1.5s ease infinite 0.2s" }} />
        </div>
      </div>
      {/* Center skeleton content */}
      <div style={{ width: 200, height: 12, borderRadius: 6, background: "#e8e4df", marginBottom: 16, animation: "skeletonPulse 1.5s ease infinite 0.3s" }} />
      <div style={{ width: 120, height: 40, borderRadius: 8, background: "#e8e4df", marginBottom: 24, animation: "skeletonPulse 1.5s ease infinite 0.4s" }} />
      <div style={{ width: "60%", maxWidth: 300, height: 8, borderRadius: 4, background: "#e8e4df", animation: "skeletonPulse 1.5s ease infinite 0.5s" }} />
      <div style={{ marginTop: 32, fontSize: 12, fontWeight: 500, letterSpacing: 1, color: "#bbb" }}>HAUSHALT</div>
    </div>
  )
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <LangProvider>
      <CartProvider>
        <AdminProvider>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/kuche" element={<App />} />
              <Route path="/wohnzimmer" element={<VegetablesApp />} />
              <Route path="/galerie" element={<GalleryPage />} />
              <Route path="/dining" element={<DiningApp />} />
              <Route path="/cozy-living" element={<CozyLivingApp />} />
              <Route path="/bathroom" element={<BathroomApp />} />
              <Route path="/room/1" element={<RoomApp />} />
              <Route path="/room/:id" element={<RoomPlaceholder />} />
            </Routes>
          </Suspense>
        </AdminProvider>
      </CartProvider>
    </LangProvider>
  </BrowserRouter>
)

// Register service worker for offline caching of GLB assets
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {})
  })
}
