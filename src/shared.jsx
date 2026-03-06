import { useRef, useState, useEffect } from "react"
import { easing } from "maath"
import { useFrame, useThree } from "@react-three/fiber"
import { EffectComposer, Outline, N8AO, TiltShift2, ToneMapping } from "@react-three/postprocessing"
import { useTranslations } from "./i18n"

// ===== Touch Detection (shared across all files) =====
export const isTouchDevice = () => "ontouchstart" in window || navigator.maxTouchPoints > 0
export const isMobile = () => window.innerWidth <= 768

// ===== Rotate Hint for Mobile Portrait =====
export function RotateHint() {
  const [show, setShow] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  const t = useTranslations()
  useEffect(() => {
    if (!isTouchDevice()) return
    const check = () => setShow(window.innerHeight > window.innerWidth)
    check()
    window.addEventListener("resize", check)
    const onOrientation = () => setTimeout(check, 200)
    window.addEventListener("orientationchange", onOrientation)
    const onListOpen = (e) => setListOpen(!!e.detail)
    window.addEventListener("list-open", onListOpen)
    return () => {
      window.removeEventListener("resize", check)
      window.removeEventListener("orientationchange", onOrientation)
      window.removeEventListener("list-open", onListOpen)
    }
  }, [])
  if (!show || listOpen) return null
  return (
    <div style={{
      position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
      zIndex: 2000, background: "rgba(0,0,0,0.6)", color: "#fff",
      padding: "10px 22px", borderRadius: "28px", fontSize: "13px",
      fontFamily: "'Inter','Segoe UI',sans-serif", fontWeight: 600,
      letterSpacing: "0.5px",
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", gap: "10px",
      animation: "fadeInUp 0.5s ease", pointerEvents: "none",
      whiteSpace: "nowrap",
    }}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "20px", height: "20px", flexShrink: 0,
          animation: "rotatePhone 2s ease-in-out infinite",
        }}
      >
        <path d="M18.9998 17.5V6.5C19.0627 5.37366 18.1259 4 16.4999 4H7.49988C5.87393 4 4.93706 5.37366 4.99988 6.5V17.5C4.93706 18.6264 5.87393 20 7.49988 20H16.4999C18.1259 20 19.0627 18.6264 18.9998 17.5Z" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 5H10" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {t.rotateHint}
    </div>
  )
}

// ===== Shared Effects (postprocessing + camera + touch controls) =====
export function Effects({ roomId = "default" }) {
  const { size } = useThree()
  const isTouch = isTouchDevice()
  const touchTarget = useRef({ x: 0, y: 0, zoom: 0 })
  const touchCurrent = useRef({ x: 0, y: 0, zoom: 0 })
  const manualZoom = useRef(0)
  const autoZoom = useRef(0)
  const cameraControlActive = useRef(false)
  const savedCamera = useRef(null)
  const storageKey = `haushalt-camera-${roomId}`

  // Load saved camera from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) savedCamera.current = JSON.parse(stored)
    } catch (e) { /* ignore */ }
  }, [storageKey])

  // Listen for camera-loaded event (from Supabase fetch in SceneOverlay)
  useEffect(() => {
    const onLoaded = (e) => {
      const cam = e.detail
      if (cam) {
        savedCamera.current = cam
        orbit.current.theta = cam.theta ?? DEFAULT_THETA
        orbit.current.phi = cam.phi ?? DEFAULT_PHI
        orbit.current.radius = cam.radius ?? DEFAULT_RADIUS
      }
    }
    window.addEventListener("camera-loaded", onLoaded)
    return () => window.removeEventListener("camera-loaded", onLoaded)
  }, [])

  // Listen for camera-control-mode events from the overlay
  useEffect(() => {
    const onMode = (e) => { cameraControlActive.current = !!e.detail }
    const onSave = () => {
      // Will be called from the save button — save current cam position
      const cam = savedCamera.current
      if (cam) {
        localStorage.setItem(storageKey, JSON.stringify(cam))
        window.dispatchEvent(new CustomEvent("camera-saved"))
      }
    }
    const onReset = () => {
      localStorage.removeItem(storageKey)
      savedCamera.current = null
      window.dispatchEvent(new CustomEvent("camera-saved"))
    }
    window.addEventListener("camera-control-mode", onMode)
    window.addEventListener("camera-save", onSave)
    window.addEventListener("camera-reset", onReset)
    return () => {
      window.removeEventListener("camera-control-mode", onMode)
      window.removeEventListener("camera-save", onSave)
      window.removeEventListener("camera-reset", onReset)
    }
  }, [storageKey])

  // Orbit camera control — full 360° using spherical coords around scene center
  const ORBIT_CENTER = useRef([0.0, 0.2, -0.5])
  // Default perspective matching the current good view from the screenshot
  const DEFAULT_THETA = 1.62    // slightly right of center front
  const DEFAULT_PHI = 1.18      // slightly above center
  const DEFAULT_RADIUS = 8.2

  const orbit = useRef({ theta: DEFAULT_THETA, phi: DEFAULT_PHI, radius: DEFAULT_RADIUS })
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, baseTheta: 0, basePhi: 0 })

  // Initialise orbit from saved camera
  useEffect(() => {
    if (savedCamera.current) {
      orbit.current.theta = savedCamera.current.theta ?? DEFAULT_THETA
      orbit.current.phi = savedCamera.current.phi ?? DEFAULT_PHI
      orbit.current.radius = savedCamera.current.radius ?? DEFAULT_RADIUS
    }
  }, [])

  useEffect(() => {
    const onDown = (e) => {
      if (!cameraControlActive.current) return
      dragState.current = {
        dragging: true,
        startX: e.clientX,
        startY: e.clientY,
        baseTheta: orbit.current.theta,
        basePhi: orbit.current.phi,
      }
    }
    const onMove = (e) => {
      if (!dragState.current.dragging) return
      const dx = (e.clientX - dragState.current.startX) / window.innerWidth * Math.PI * 2
      const dy = (e.clientY - dragState.current.startY) / window.innerHeight * Math.PI
      // Horizontal: full 360° — no clamping on theta
      orbit.current.theta = dragState.current.baseTheta - dx
      // Vertical: clamp between ~10° and ~170° to avoid gimbal lock at poles
      orbit.current.phi = Math.max(0.15, Math.min(Math.PI - 0.15, dragState.current.basePhi - dy))
    }
    const onUp = () => {
      if (dragState.current.dragging) {
        dragState.current.dragging = false
        savedCamera.current = { ...orbit.current }
      }
    }
    const onWheel = (e) => {
      if (!cameraControlActive.current) return
      orbit.current.radius = Math.max(2, Math.min(14, orbit.current.radius + e.deltaY / 300))
      savedCamera.current = { ...orbit.current }
    }
    window.addEventListener("mousedown", onDown)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    window.addEventListener("wheel", onWheel, { passive: true })
    return () => {
      window.removeEventListener("mousedown", onDown)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
      window.removeEventListener("wheel", onWheel)
    }
  }, [])

  // Auto-zoom on mobile tap selection
  useEffect(() => {
    if (!isTouch) return
    const onSelect = (e) => { autoZoom.current = e.detail ? 1.2 : 0 }
    window.addEventListener("mobile-select", onSelect)
    return () => window.removeEventListener("mobile-select", onSelect)
  }, [isTouch])

  // Swipe + Pinch-to-Zoom on mobile
  useEffect(() => {
    if (!isTouch) return
    let startX = 0, startY = 0, baseX = 0, baseY = 0
    let initialPinchDist = 0, baseZoom = 0
    const dist = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)

    const onStart = (e) => {
      if (e.touches.length === 2) {
        initialPinchDist = dist(e.touches[0], e.touches[1])
        baseZoom = touchTarget.current.zoom || 0
      } else if (e.touches.length === 1) {
        startX = e.touches[0].clientX; startY = e.touches[0].clientY
        baseX = touchTarget.current.x; baseY = touchTarget.current.y
      }
    }
    const onMove = (e) => {
      if (e.touches.length === 2) {
        const d = dist(e.touches[0], e.touches[1])
        touchTarget.current.zoom = Math.max(-1, Math.min(3, baseZoom + (d - initialPinchDist) / 200))
      } else if (e.touches.length === 1) {
        const dx = (e.touches[0].clientX - startX) / window.innerWidth * 5
        const dy = (e.touches[0].clientY - startY) / window.innerHeight * 2.5
        touchTarget.current.x = Math.max(-1.2, Math.min(1.2, baseX + dx))
        touchTarget.current.y = Math.max(-0.3, Math.min(0.5, baseY + dy))
      }
    }
    window.addEventListener("touchstart", onStart, { passive: true })
    window.addEventListener("touchmove", onMove, { passive: true })
    return () => {
      window.removeEventListener("touchstart", onStart)
      window.removeEventListener("touchmove", onMove)
    }
  }, [isTouch])

  // Camera animation per frame
  useFrame((state, delta) => {
    // If camera control is actively being dragged, use pure orbit (no mouse hover)
    if (cameraControlActive.current) {
      const o = orbit.current
      const center = ORBIT_CENTER.current
      const r = o.radius
      const tX = center[0] + r * Math.sin(o.phi) * Math.sin(o.theta)
      const tY = center[1] + r * Math.cos(o.phi)
      const tZ = center[2] + r * Math.sin(o.phi) * Math.cos(o.theta)
      easing.damp3(state.camera.position, [tX, tY, tZ], 0.2, delta)
      state.camera.lookAt(center[0], center[1], center[2])
      return
    }

    // Use saved orbit (or default) + subtle mouse hover on desktop
    if (savedCamera.current || !isTouch) {
      const o = savedCamera.current || orbit.current
      const center = ORBIT_CENTER.current
      const r = o.radius
      // Base spherical position
      const baseX = center[0] + r * Math.sin(o.phi) * Math.sin(o.theta)
      const baseY = center[1] + r * Math.cos(o.phi)
      const baseZ = center[2] + r * Math.sin(o.phi) * Math.cos(o.theta)

      if (!isTouch) {
        // Add subtle mouse hover offset (±0.3 range) for a living feel
        const px = Math.max(-0.5, Math.min(0.5, state.pointer.x))
        const py = Math.max(-0.3, Math.min(0.3, state.pointer.y))
        const hoverX = baseX + px * 0.3
        const hoverY = baseY + py * 0.15
        const hoverZ = baseZ
        easing.damp3(state.camera.position, [hoverX, hoverY, hoverZ], 0.3, delta)
      } else {
        easing.damp3(state.camera.position, [baseX, baseY, baseZ], 0.25, delta)
      }
      // Look at center with slight hover influence
      const lx = center[0] + (isTouch ? 0 : state.pointer.x * 0.08)
      const ly = center[1] + (isTouch ? 0 : state.pointer.y * 0.04)
      state.camera.lookAt(lx, ly, center[2])
      return
    }

    // Touch-only fallback (no saved camera)
    const t = touchTarget.current, c = touchCurrent.current
    c.x += (t.x - c.x) * 0.08
    c.y += (t.y - c.y) * 0.08
    c.zoom += (t.zoom - c.zoom) * 0.08
    manualZoom.current = c.zoom
    const totalZoom = manualZoom.current + autoZoom.current
    let targetX = c.x
    let targetY = 1 + c.y / 2
    let targetZ = 8 + Math.atan(c.x * 2) - totalZoom
    targetX = Math.max(-1.2, Math.min(1.2, targetX))
    targetY = Math.max(0.75, Math.min(1.4, targetY))
    targetZ = Math.max(5.5, Math.min(9.5, targetZ))
    easing.damp3(state.camera.position, [targetX, targetY, targetZ], 0.3, delta)
    const lookX = Math.max(-1.0, Math.min(1.0, state.camera.position.x * 0.9))
    state.camera.lookAt(lookX, 0.2, -4)
  })

  return (
    <EffectComposer stencilBuffer disableNormalPass autoClear={false} multisampling={isTouch ? 0 : 2}>
      <N8AO halfRes aoSamples={isTouch ? 2 : 4} aoRadius={0.4} distanceFalloff={0.75} intensity={1} />
      <Outline visibleEdgeColor="white" hiddenEdgeColor="white" blur width={size.width * (isTouch ? 0.75 : 1.25)} edgeStrength={10} />
      {!isTouch && <TiltShift2 samples={3} blur={0.075} />}
      <ToneMapping />
    </EffectComposer>
  )
}
