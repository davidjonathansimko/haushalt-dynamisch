import { Suspense, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { Sky, Bvh, useProgress, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei"
import { Selection } from "@react-three/postprocessing"
import { BathroomScene } from "./BathroomScene"
import { SceneOverlay } from "./SceneOverlay"
import { isTouchDevice, RotateHint, Effects } from "./shared"

const BATHROOM_ITEMS = [
  { key: "BADEWANNE", priceEur: 2499 },
  { key: "WASCHBECKEN", priceEur: 899 },
  { key: "SPIEGEL", priceEur: 349 },
  { key: "DUSCHE", priceEur: 1899 },
  { key: "SCHRANK", priceEur: 1199 },
  { key: "HANDTUCHHALTER", priceEur: 79 },
  { key: "TEPPICH", priceEur: 149 },
  { key: "PFLANZE", priceEur: 59 },
  { key: "BELEUCHTUNG", priceEur: 199 },
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
      <div style={{ width: "80%", maxWidth: 400, marginBottom: 32 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 80, borderRadius: 12, background: "#e8e4df", animation: "skeletonPulse 1.5s ease infinite" }} />
          <div style={{ flex: 2, height: 80, borderRadius: 12, background: "#e8e4df", animation: "skeletonPulse 1.5s ease infinite 0.2s" }} />
        </div>
        <div style={{ height: 120, borderRadius: 12, background: "#e8e4df", animation: "skeletonPulse 1.5s ease infinite 0.4s" }} />
      </div>
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

export function BathroomApp() {
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
      <SceneOverlay items={BATHROOM_ITEMS} hovered={hovered} roomId="bathroom" />
      <Suspense fallback={<Loader />}>
        <Canvas
          flat
          dpr={[1, isTouch ? 1 : 1.5]}
          gl={{ antialias: false, powerPreference: "high-performance" }}
          camera={{ position: [-0.4, 1.0, 2.2], fov: isTouch ? (isLandscape ? 32 : 30) : 25, near: 0.5, far: 20 }}
          style={{ touchAction: "none" }}
        >
          <ambientLight intensity={1.5 * Math.PI} />
          <color attach="background" args={["#f5f2ee"]} />
          <Sky />
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <Bvh firstHitOnly>
            <Selection>
              <Effects roomId="bathroom" />
              <BathroomScene rotation={[0, -Math.PI / 2 + 0.05, 0]} position={[0.4, -0.75, -0.3]} />
            </Selection>
          </Bvh>
        </Canvas>
      </Suspense>
    </>
  )
}
