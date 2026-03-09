import * as THREE from "three"
import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Image, ScrollControls, Scroll, useScroll } from "@react-three/drei"
import { proxy, useSnapshot } from "valtio"
import { easing } from "maath"
import { useNavigate } from "react-router-dom"
import { useTranslations } from "./i18n"
import { isMobile as checkMobile } from "./shared"

// ===== Gallery state =====
const galleryState = proxy({
  clicked: null,
  urls: [
    "/room0.png",          // 0  → Wohnzimmer
    "/room1new.png",       // 1  → Zimmer
    "/room2to8/room2/room2.png", // 2  → Dining
    "/room2to8/room3/room3.png", // 3  → Cozy Living
    "/room2.jpg",          // 4  → placeholder
    "/room3.jpg",          // 5  → placeholder
    "/room4.jpg",          // 6  → placeholder
    "/room5.jpg",          // 7  → placeholder
    "/room6.jpg",          // 8  → placeholder
    "/room7.jpg",          // 9  → placeholder
    "/room8.jpg",          // 10 → placeholder
    "/room9.jpg",          // 11 → placeholder
    "/room10.jpg",         // 12 → placeholder
  ],
  // Maps index → route
  routes: [
    "/wohnzimmer",   // 0
    "/room/1",       // 1
    "/dining",       // 2
    "/cozy-living",  // 3
    "/room/2",       // 4
    "/room/3",       // 5
    "/room/4",       // 6
    "/room/5",       // 7
    "/room/6",       // 8
    "/room/7",       // 9
    "/room/8",       // 10
    "/room/9",       // 11
    "/room/10",      // 12
  ],
})

// ===== Minimap — thin vertical bars at bottom =====
const lineMaterial = new THREE.LineBasicMaterial({ color: "white" })
const lineGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(0, -0.5, 0),
  new THREE.Vector3(0, 0.5, 0),
])

function Minimap() {
  const ref = useRef()
  const scroll = useScroll()
  const { urls } = useSnapshot(galleryState)
  const { height } = useThree((s) => s.viewport)
  useFrame((state, delta) => {
    ref.current.children.forEach((child, index) => {
      const y = scroll.curve(index / urls.length - 1.5 / urls.length, 4 / urls.length)
      easing.damp(child.scale, "y", 0.15 + y / 6, 0.15, delta)
    })
  })
  return (
    <group ref={ref}>
      {urls.map((_, i) => (
        <line
          key={i}
          geometry={lineGeometry}
          material={lineMaterial}
          position={[i * 0.06 - urls.length * 0.03, -height / 2 + 0.6, 0]}
        />
      ))}
    </group>
  )
}

// ===== Single gallery image item =====
function Item({ index, position, scale, c = new THREE.Color(), ...props }) {
  const ref = useRef()
  const scroll = useScroll()
  const { clicked, urls } = useSnapshot(galleryState)
  const [hovered, hover] = useState(false)
  const click = () => (galleryState.clicked = index === clicked ? null : index)
  const over = () => hover(true)
  const out = () => hover(false)
  useFrame((state, delta) => {
    const y = scroll.curve(index / urls.length - 1.5 / urls.length, 4 / urls.length)
    easing.damp3(
      ref.current.scale,
      [clicked === index ? 4.7 : scale[0], clicked === index ? 5 : 4 + y, 1],
      0.15,
      delta
    )
    ref.current.material.scale.set(ref.current.scale.x, ref.current.scale.y)
    if (clicked !== null && index < clicked)
      easing.damp(ref.current.position, "x", position[0] - 2, 0.15, delta)
    if (clicked !== null && index > clicked)
      easing.damp(ref.current.position, "x", position[0] + 2, 0.15, delta)
    if (clicked === null || clicked === index)
      easing.damp(ref.current.position, "x", position[0], 0.15, delta)
    easing.damp(
      ref.current.material,
      "grayscale",
      hovered || clicked === index ? 0 : Math.max(0, 1 - y),
      0.15,
      delta
    )
    easing.dampC(
      ref.current.material.color,
      hovered || clicked === index ? "white" : "#aaa",
      hovered ? 0.3 : 0.15,
      delta
    )
  })
  return (
    <Image
      ref={ref}
      {...props}
      position={position}
      scale={scale}
      onClick={click}
      onPointerOver={over}
      onPointerOut={out}
    />
  )
}

// ===== Items container with scroll controls =====
function Items({ w = 0.7, gap = 0.15 }) {
  const { urls } = useSnapshot(galleryState)
  const { width } = useThree((s) => s.viewport)
  const xW = w + gap
  return (
    <ScrollControls horizontal damping={0.1} pages={(width - xW + urls.length * xW) / width}>
      <Minimap />
      <Scroll>
        {urls.map((url, i) => (
          <Item key={i} index={i} position={[i * xW, 0, 0]} scale={[w, 4, 1]} url={url} />
        ))}
      </Scroll>
    </ScrollControls>
  )
}

// ===== Items container for PORTRAIT mobile (vertical scroll) =====
function ItemsVertical({ h = 0.7, gap = 0.15 }) {
  const { urls } = useSnapshot(galleryState)
  const { height } = useThree((s) => s.viewport)
  const yH = h + gap
  return (
    <ScrollControls damping={0.1} pages={(height - yH + urls.length * yH) / height}>
      <MinimapVertical />
      <Scroll>
        {urls.map((url, i) => (
          <ItemVertical key={i} index={i} position={[0, -i * yH, 0]} scale={[4, h, 1]} url={url} />
        ))}
      </Scroll>
    </ScrollControls>
  )
}

function MinimapVertical() {
  const ref = useRef()
  const scroll = useScroll()
  const { urls } = useSnapshot(galleryState)
  const { width } = useThree((s) => s.viewport)
  const hLineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-0.5, 0, 0),
    new THREE.Vector3(0.5, 0, 0),
  ])
  useFrame((state, delta) => {
    ref.current.children.forEach((child, index) => {
      const y = scroll.curve(index / urls.length - 1.5 / urls.length, 4 / urls.length)
      easing.damp(child.scale, "x", 0.15 + y / 6, 0.15, delta)
    })
  })
  return (
    <group ref={ref}>
      {urls.map((_, i) => (
        <line
          key={i}
          geometry={hLineGeometry}
          material={lineMaterial}
          position={[width / 2 - 0.6, -i * 0.06 + urls.length * 0.03, 0]}
        />
      ))}
    </group>
  )
}

function ItemVertical({ index, position, scale, c = new THREE.Color(), ...props }) {
  const ref = useRef()
  const scroll = useScroll()
  const { clicked, urls } = useSnapshot(galleryState)
  const [hovered, hover] = useState(false)
  const click = () => (galleryState.clicked = index === clicked ? null : index)
  const over = () => hover(true)
  const out = () => hover(false)
  useFrame((state, delta) => {
    const y = scroll.curve(index / urls.length - 1.5 / urls.length, 4 / urls.length)
    easing.damp3(
      ref.current.scale,
      [clicked === index ? 5 : 4 + y, clicked === index ? 4.7 : scale[1], 1],
      0.15,
      delta
    )
    ref.current.material.scale.set(ref.current.scale.x, ref.current.scale.y)
    if (clicked !== null && index < clicked)
      easing.damp(ref.current.position, "y", position[1] + 2, 0.15, delta)
    if (clicked !== null && index > clicked)
      easing.damp(ref.current.position, "y", position[1] - 2, 0.15, delta)
    if (clicked === null || clicked === index)
      easing.damp(ref.current.position, "y", position[1], 0.15, delta)
    easing.damp(
      ref.current.material,
      "grayscale",
      hovered || clicked === index ? 0 : Math.max(0, 1 - y),
      0.15,
      delta
    )
    easing.dampC(
      ref.current.material.color,
      hovered || clicked === index ? "white" : "#aaa",
      hovered ? 0.3 : 0.15,
      delta
    )
  })
  return (
    <Image
      ref={ref}
      {...props}
      position={position}
      scale={scale}
      onClick={click}
      onPointerOver={over}
      onPointerOut={out}
    />
  )
}

// ===== Main Gallery Page =====
const HEADER_H = 56  // header bar height in px

export function GalleryPage() {
  const [mobile, setMobile] = useState(checkMobile())
  const [portrait, setPortrait] = useState(window.innerHeight > window.innerWidth)
  const navigate = useNavigate()
  const t = useTranslations()

  useEffect(() => {
    const r = () => {
      setMobile(checkMobile())
      setPortrait(window.innerHeight > window.innerWidth)
    }
    window.addEventListener("resize", r)
    window.addEventListener("orientationchange", () => setTimeout(r, 200))
    return () => {
      window.removeEventListener("resize", r)
      window.removeEventListener("orientationchange", r)
    }
  }, [])

  // Reset clicked state when entering
  useEffect(() => {
    galleryState.clicked = null
  }, [])

  const handleMissed = () => (galleryState.clicked = null)

  return (
    <div style={{ position: "fixed", inset: 0, background: "#151515", display: "flex", flexDirection: "column" }}>
      {/* ── Dark header bar with shadow ── */}
      <div style={{
        height: HEADER_H,
        minHeight: HEADER_H,
        background: "#1a1a1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
        zIndex: 20,
        fontFamily: "'Inter','Segoe UI',sans-serif",
        position: "relative",
      }}>
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 28,
            padding: mobile ? "8px 16px" : "10px 22px",
            color: "#fff",
            fontSize: mobile ? 12 : 13,
            fontWeight: 600,
            cursor: "pointer",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            letterSpacing: "0.5px",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span style={{ fontSize: 16 }}>←</span>
          {t.back}
        </button>

        {/* Title */}
        <div style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: mobile ? 11 : 13,
          fontWeight: 600,
          letterSpacing: "2px",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)",
        }}>
          ✦ {t.gallery}
        </div>
      </div>

      {/* ── Canvas area: fills remaining space with small gaps ── */}
      <div style={{
        flex: 1,
        position: "relative",
        margin: mobile ? "6px 0 6px 0" : "10px 0 10px 0",
        overflow: "hidden",
      }}>
        <Canvas
          gl={{ antialias: false }}
          dpr={[1, 1.5]}
          onPointerMissed={handleMissed}
          style={{ position: "absolute", inset: 0 }}
        >
          {mobile && portrait ? <ItemsVertical /> : <Items />}
        </Canvas>

        {/* Floating "Open room" button when image is clicked */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          fontFamily: "'Inter','Segoe UI',sans-serif",
        }}>
          <GalleryAction navigate={navigate} mobile={mobile} t={t} />
        </div>
      </div>

      {/* ── Thin footer spacer ── */}
      <div style={{
        height: mobile ? 6 : 10,
        minHeight: mobile ? 6 : 10,
        background: "#151515",
      }} />
    </div>
  )
}

// ===== Button to navigate to room when image is clicked =====
function GalleryAction({ navigate, mobile, t }) {
  const { clicked, routes } = useSnapshot(galleryState)
  if (clicked === null) return null

  const roomLabel = clicked === 0 ? t.living
    : clicked === 1 ? t.room1
    : clicked === 2 ? t.dining
    : clicked === 3 ? t.cozyLiving
    : `Room ${clicked}`

  return (
    <button
      onClick={() => navigate(routes[clicked])}
      style={{
        pointerEvents: "all",
        position: "absolute",
        bottom: mobile ? 28 : 40,
        left: "50%", transform: "translateX(-50%)",
        background: "#fff", color: "#111",
        border: "none", borderRadius: 28,
        padding: mobile ? "12px 28px" : "14px 36px",
        fontSize: mobile ? 13 : 14, fontWeight: 700,
        letterSpacing: "0.5px",
        cursor: "pointer",
        display: "flex", alignItems: "center", gap: 10,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        animation: "fadeIn 0.3s ease",
        fontFamily: "'Inter','Segoe UI',sans-serif",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {t.discover} → {roomLabel}
    </button>
  )
}
