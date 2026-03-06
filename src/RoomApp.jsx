import { Suspense, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { Sky, Bvh, useProgress, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei"
import { Selection } from "@react-three/postprocessing"
import { RoomScene } from "./RoomScene"
import { SceneOverlay } from "./SceneOverlay"
import { isTouchDevice, RotateHint, Effects } from "./shared"

const ROOM_ITEMS = [
  { key: "BETT", priceEur: 2499 },
  { key: "SCHREIBTISCH", priceEur: 899 },
  { key: "STUHL", priceEur: 349 },
  { key: "MATTE", priceEur: 199 },
  { key: "FENSTER", priceEur: 599 },
  { key: "REGAL", priceEur: 449 },
  { key: "BODEN", priceEur: 1299 },
]

function Loader() {
  const { progress } = useProgress()
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 3000,
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      background: "#f5f2ee",
      fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>
      {/* Skeleton room outline */}
      <div style={{ width: "80%", maxWidth: 400, marginBottom: 32 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 80, borderRadius: 12, background: "#e8e4df", animation: "skeletonPulse 1.5s ease infinite" }} />
          <div style={{ flex: 2, height: 80, borderRadius: 12, background: "#e8e4df", animation: "skeletonPulse 1.5s ease infinite 0.2s" }} />
        </div>
        <div style={{ height: 120, borderRadius: 12, background: "#e8e4df", animation: "skeletonPulse 1.5s ease infinite 0.4s" }} />
      </div>
      {/* Progress bar */}
      <div style={{ width: 200, height: 3, borderRadius: 2, background: "#e0dcd7", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 2, background: "#1a1a1a",
          width: `${progress}%`, transition: "width 0.3s ease",
        }} />
      </div>
      <div style={{ marginTop: 12, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: "#bbb" }}>
        {Math.round(progress)}%
      </div>
      <div style={{ marginTop: 8, fontSize: 12, fontWeight: 500, letterSpacing: 1, color: "#ccc" }}>
        HAUSHALT
      </div>
    </div>
  )
}

export function RoomApp() {
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const onHover = (e) => setHovered(e.detail)
    window.addEventListener("scene-hover", onHover)
    return () => window.removeEventListener("scene-hover", onHover)
  }, [])

  const isTouch = isTouchDevice()
  const isLandscape = isTouch && window.innerWidth > window.innerHeight

  return (
    <>
      <RotateHint />
      <SceneOverlay items={ROOM_ITEMS} hovered={hovered} roomId="room1" />
      <Suspense fallback={<Loader />}>
        <Canvas
          flat
          dpr={[1, isTouch ? 1 : 1.5]}
          gl={{ antialias: false, powerPreference: "high-performance" }}
          camera={{ position: [5, 3, 14], fov: isTouch ? (isLandscape ? 50 : 45) : 42, near: 0.1, far: 50 }}
          style={{ touchAction: "none" }}
        >
          <ambientLight intensity={1.5 * Math.PI} />
          <Sky />
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <Bvh firstHitOnly>
            <Selection>
              <Effects roomId="room1" />
              <RoomScene scale={0.45} position={[0, -1.2, 0]} />
            </Selection>
          </Bvh>
        </Canvas>
      </Suspense>
    </>
  )
}
