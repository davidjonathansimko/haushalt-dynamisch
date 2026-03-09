import { useState, useCallback, useEffect, useMemo } from "react"
import { debounce } from "lodash"
import { useGLTF, Text, Environment } from "@react-three/drei"
import { Select } from "@react-three/postprocessing"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"
import { Price } from "./Price"
import { useLang, useTranslations, itemNames } from "./i18n"
import { isTouchDevice } from "./shared"

// Base prices in EUR
const PRICES_EUR = {
  TOILETTE: 699,
  SCHRANK: 549,
  SPIEGEL: 249,
  BADTEPPICH: 79,
  FLASCHEN: 39,
  BILD: 159,
  PFLANZE: 49,
}

const GLB_PATH = "/room2to8/room4/modern_bathroom-draco.glb"

export function LoftBedroomScene(props) {
  const { nodes, materials } = useGLTF(GLB_PATH)
  const [hovered, hover] = useState(null)
  const debouncedHover = useCallback(debounce(hover, 30), [])
  const { lang } = useLang()
  const t = useTranslations()

  useEffect(() => {
    const onOverlaySelect = (e) => {
      hover(e.detail)
      if (isTouchDevice() && e.detail) {
        window.dispatchEvent(new CustomEvent("mobile-select", { detail: e.detail }))
      }
    }
    window.addEventListener("overlay-select", onOverlaySelect)
    return () => window.removeEventListener("overlay-select", onOverlaySelect)
  }, [])

  const over = (name) => (e) => (e.stopPropagation(), debouncedHover(name),
    window.dispatchEvent(new CustomEvent("scene-hover", { detail: name })))
  const out = () => {
    debouncedHover(null)
    window.dispatchEvent(new CustomEvent("scene-hover", { detail: null }))
  }
  const tap = (name) => (e) => {
    e.stopPropagation()
    if (isTouchDevice()) {
      hover((prev) => {
        const next = prev === name ? null : name
        window.dispatchEvent(new CustomEvent("mobile-select", { detail: next }))
        window.dispatchEvent(new CustomEvent("scene-hover", { detail: next }))
        return next
      })
    }
  }

  const getLocalName = (key) => itemNames[lang]?.[key] || key
  const priceEur = PRICES_EUR[hovered] ?? 699
  const displayName = hovered ? getLocalName(hovered) : t.defaultTitleLoft
  const { size } = useThree()
  const isPortraitMobile = size.width < size.height && size.width < 600
  // Price on the right wall near the toilet
  const pricePos = isPortraitMobile ? [1.8, 0.1, -0.8] : [1.8, 0.1, -0.8]

  // Override mirror material to be reflective bright
  const mirrorMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#c8dde8"),
      metalness: 0.95,
      roughness: 0.05,
      envMapIntensity: 2.5,
    })
    return mat
  }, [])

  // Brighten the floor material
  useEffect(() => {
    if (materials.Floor) {
      materials.Floor.color = new THREE.Color("#d4cfc8")
      materials.Floor.roughness = 0.4
      materials.Floor.metalness = 0.0
      materials.Floor.needsUpdate = true
    }
    // Make MirrorLight (ring around mirror) glow
    if (materials.MirrorLight) {
      materials.MirrorLight.emissive = new THREE.Color("#ffffff")
      materials.MirrorLight.emissiveIntensity = 1.5
      materials.MirrorLight.needsUpdate = true
    }
    // Make WindowLight glow to simulate light through window
    if (materials.WindowLight) {
      materials.WindowLight.emissive = new THREE.Color("#fff8e7")
      materials.WindowLight.emissiveIntensity = 2.0
      materials.WindowLight.needsUpdate = true
    }
    // Brighten walls slightly
    if (materials.SideWalls) {
      materials.SideWalls.roughness = 0.6
      materials.SideWalls.needsUpdate = true
    }
  }, [materials])

  return (
    <>
      <group {...props}>
        <group rotation={[-Math.PI / 2, 0, 0]} scale={0.488}>
          <group rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
            <group position={[2.016, 0, 0]} rotation={[-Math.PI / 2, 0, Math.PI]} scale={[297, 330, 23.76]}>

              {/* ===== Non-interactive: walls, floor, structure ===== */}
              <mesh geometry={nodes.Bathroom_SideWalls_0.geometry} material={materials.SideWalls} />
              <mesh geometry={nodes.Bathroom_BackWall_0.geometry} material={materials.BackWall} />
              <mesh geometry={nodes.Bathroom_Floor_0.geometry} material={materials.Floor} />
              <mesh geometry={nodes.Bathroom_SkirtingBoard_0.geometry} material={materials.SkirtingBoard} />
              <mesh geometry={nodes.Bathroom_WindowTrim_0.geometry} material={materials.WindowTrim} />
              <mesh geometry={nodes.Bathroom_WindowLight_0.geometry} material={materials.WindowLight} />
              <mesh geometry={nodes.Bathroom_Light_0.geometry} material={materials.Light} />
              <mesh geometry={nodes.Bathroom_MirrorLight_0.geometry} material={materials.MirrorLight} />
              <mesh geometry={nodes.Bathroom_MirrorTrim_0.geometry} material={materials.MirrorTrim} />
              <mesh geometry={nodes.Bathroom_Chrome_0.geometry} material={materials.Chrome} />
              <mesh geometry={nodes.Bathroom_ToiletRolls_0.geometry} material={materials.ToiletRolls} />
              <mesh geometry={nodes.Bathroom_ToiletFlushButton_0.geometry} material={materials.ToiletFlushButton} />
              <mesh geometry={nodes.Bathroom_ToiletRoll_0.geometry} material={materials.ToiletRoll} />

              {/* ===== Interactive: TOILETTE (Toilet) ===== */}
              <Select enabled={hovered === "TOILETTE"} onPointerOver={over("TOILETTE")} onPointerOut={out} onClick={tap("TOILETTE")}>
                <mesh geometry={nodes.Bathroom_Toilet_0.geometry} material={materials.Toilet} />
              </Select>

              {/* ===== Interactive: SCHRANK (Cabinet) ===== */}
              <Select enabled={hovered === "SCHRANK"} onPointerOver={over("SCHRANK")} onPointerOut={out} onClick={tap("SCHRANK")}>
                <mesh geometry={nodes.Bathroom_Cabinet_0.geometry} material={materials.Cabinet} />
              </Select>

              {/* ===== Interactive: SPIEGEL (Mirror) ===== */}
              <Select enabled={hovered === "SPIEGEL"} onPointerOver={over("SPIEGEL")} onPointerOut={out} onClick={tap("SPIEGEL")}>
                <mesh geometry={nodes.Bathroom_Mirror_0.geometry} material={mirrorMat} />
              </Select>

              {/* ===== Interactive: BADTEPPICH (Bath Rug) ===== */}
              <Select enabled={hovered === "BADTEPPICH"} onPointerOver={over("BADTEPPICH")} onPointerOut={out} onClick={tap("BADTEPPICH")}>
                <mesh geometry={nodes.Bathroom_ToiletRug_0.geometry} material={materials.ToiletRug} />
              </Select>

              {/* ===== Interactive: FLASCHEN (Bottles) ===== */}
              <Select enabled={hovered === "FLASCHEN"} onPointerOver={over("FLASCHEN")} onPointerOut={out} onClick={tap("FLASCHEN")}>
                <mesh geometry={nodes.Bathroom_Bottles_0.geometry} material={materials.Bottles} />
              </Select>

              {/* ===== Interactive: BILD (Picture) ===== */}
              <Select enabled={hovered === "BILD"} onPointerOver={over("BILD")} onPointerOut={out} onClick={tap("BILD")}>
                <mesh geometry={nodes.Bathroom_PictureFrame_0.geometry} material={materials.PictureFrame} />
                <mesh geometry={nodes.Bathroom_Picture_0.geometry} material={materials.Picture} />
              </Select>

              {/* ===== Interactive: PFLANZE (Plants) ===== */}
              <Select enabled={hovered === "PFLANZE"} onPointerOver={over("PFLANZE")} onPointerOut={out} onClick={tap("PFLANZE")}>
                <mesh geometry={nodes.Tree_Tree_0.geometry} material={materials.Tree} position={[-0.782, 0.769, -0.031]} scale={[0.15, 0.177, 3.406]} />
                <mesh geometry={nodes.Plants_TopPlants_0.geometry} material={materials.TopPlants} position={[0.313, 1.117, 12.415]} rotation={[0, 0, -3.054]} scale={[0.052, 0.047, 0.653]} />
              </Select>

            </group>
          </group>
        </group>
      </group>

      {/* Sunlight streaming through the window from the left */}
      <directionalLight
        position={[-4, 3, 1]}
        intensity={3.0}
        color="#fff5e0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={15}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      {/* Warm fill light to brighten the scene */}
      <pointLight position={[0, 2, 0]} intensity={1.5} color="#ffeedd" distance={8} />
      {/* Environment for mirror reflections */}
      <Environment preset="apartment" />

      <Text position={[1.8, 0.35, -0.8]} color="#1a1a1a" fontSize={0.1} font="NotoSans-Regular.ttf" letterSpacing={-0.05}
        outlineWidth={0.004} outlineColor="#ffffff" rotation={[0, -Math.PI / 2, 0]}>
        {displayName}
      </Text>
      <Price value={priceEur} currency="€" position={pricePos} />
    </>
  )
}

useGLTF.preload(GLB_PATH)
