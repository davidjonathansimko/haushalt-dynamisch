/*
  RoomScene – 3D living room scene based on "Room with soft shadows" by drcmda
  Model: room-transformed.glb (Author: Anex, License: CC-BY-4.0)
  Source: https://sketchfab.com/3d-models/room-6417cbc1870a4a1691cca06912ae0369
*/
import { useState, useCallback, useEffect } from "react"
import { debounce } from "lodash"
import { useGLTF, useEnvironment, Text } from "@react-three/drei"
import { Select } from "@react-three/postprocessing"
import { useThree } from "@react-three/fiber"
import { Price } from "./Price"
import { useLang, useTranslations, itemNames } from "./i18n"
import { isTouchDevice } from "./shared"

// Base prices in EUR for this room
const PRICES_EUR = {
  BETT: 2499,
  SCHREIBTISCH: 899,
  STUHL: 349,
  MATTE: 199,
  FENSTER: 599,
  REGAL: 449,
  BODEN: 1299,
}

export function RoomScene(props) {
  const { nodes, materials } = useGLTF("/room-transformed.glb")
  const env = useEnvironment({ preset: "city" })
  const [hovered, hover] = useState(null)
  const debouncedHover = useCallback(debounce(hover, 30), [])
  const { lang } = useLang()
  const t = useTranslations()

  // Listen for overlay-select (item clicked in list panel)
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

  const over = (name) => (e) => (
    e.stopPropagation(),
    debouncedHover(name),
    window.dispatchEvent(new CustomEvent("scene-hover", { detail: name }))
  )
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
  const priceEur = PRICES_EUR[hovered] ?? 2499
  const displayName = hovered ? getLocalName(hovered) : t.defaultTitleRoom
  const { size } = useThree()
  const isPortraitMobile = size.width < size.height && size.width < 600
  const pricePos = isPortraitMobile ? [-1.2, 0.8, -3.25] : [-2.5, 0.5, -3.25]

  return (
    <>
      <group {...props}>
        <group rotation={[-Math.PI / 2, 0, 0]}>
          {/* ===== Non-interactive decoration ===== */}
          <mesh castShadow receiveShadow geometry={nodes.Object_2.geometry} material={materials.Material} material-envMap={env} material-envMapIntensity={0.3} />
          <mesh castShadow receiveShadow geometry={nodes.Object_3.geometry} material={materials["Material.002"]} material-envMap={env} material-envMapIntensity={0.3} />

          {/* ===== Interactive objects with prices ===== */}

          {/* BETT — Material.003 (bed / main furniture) */}
          <Select enabled={hovered === "BETT"} onPointerOver={over("BETT")} onPointerOut={out} onClick={tap("BETT")}>
            <mesh castShadow receiveShadow geometry={nodes.Object_4.geometry} material={materials["Material.003"]} material-envMap={env} material-envMapIntensity={0.3} />
          </Select>

          {/* STUHL — krzeslo group (chairs) */}
          <Select enabled={hovered === "STUHL"} onPointerOver={over("STUHL")} onPointerOut={out} onClick={tap("STUHL")}>
            <mesh castShadow receiveShadow geometry={nodes.Object_6.geometry} material={materials.krzeslo_1} material-envMap={env} material-envMapIntensity={0.3} />
            <mesh castShadow receiveShadow geometry={nodes.Object_7.geometry} material={materials.krzeslo_okno} material-envMap={env} material-envMapIntensity={0.3} />
            <mesh castShadow receiveShadow geometry={nodes.Object_8.geometry} material={materials.krzeslo_prawe} material-envMap={env} material-envMapIntensity={0.3} />
            <mesh castShadow receiveShadow geometry={nodes.Object_9.geometry} material={materials.krzeslo_srodek} material-envMap={env} material-envMapIntensity={0.3} />
          </Select>

          {/* BODEN — podloga (floor) */}
          <Select enabled={hovered === "BODEN"} onPointerOver={over("BODEN")} onPointerOut={out} onClick={tap("BODEN")}>
            <mesh castShadow receiveShadow geometry={nodes.Object_10.geometry} material={materials.podloga} />
          </Select>

          {/* FENSTER — sciana_okno (window wall) */}
          <Select enabled={hovered === "FENSTER"} onPointerOver={over("FENSTER")} onPointerOut={out} onClick={tap("FENSTER")}>
            <mesh castShadow receiveShadow geometry={nodes.Object_11.geometry} material={materials.sciana_okno} material-envMap={env} material-envMapIntensity={0.2} />
          </Select>

          {/* SCHREIBTISCH — stolik group (desk/table) */}
          <Select enabled={hovered === "SCHREIBTISCH"} onPointerOver={over("SCHREIBTISCH")} onPointerOut={out} onClick={tap("SCHREIBTISCH")}>
            <mesh castShadow receiveShadow geometry={nodes.Object_12.geometry} material={materials["stolik.001"]} material-envMap={env} material-envMapIntensity={0.3} />
            <mesh castShadow receiveShadow geometry={nodes.Object_18.geometry} material={materials.stolik} material-envMap={env} material-envMapIntensity={0.3} />
          </Select>

          {/* REGAL — Material.006 (shelf/bookcase) */}
          <Select enabled={hovered === "REGAL"} onPointerOver={over("REGAL")} onPointerOut={out} onClick={tap("REGAL")}>
            <mesh castShadow receiveShadow geometry={nodes.Object_16.geometry} material={materials["Material.006"]} material-envMap={env} material-envMapIntensity={0.3} />
          </Select>

          {/* MATTE — mata (mat/rug) */}
          <Select enabled={hovered === "MATTE"} onPointerOver={over("MATTE")} onPointerOut={out} onClick={tap("MATTE")}>
            <mesh castShadow receiveShadow geometry={nodes.Object_17.geometry} material={materials.mata} />
          </Select>

          {/* Non-interactive remaining meshes */}
          <mesh castShadow receiveShadow geometry={nodes.Object_5.geometry} material={materials["Material.004"]} />
          <mesh geometry={nodes.Object_13.geometry}>
            <meshStandardMaterial transparent opacity={0.5} />
          </mesh>
          <mesh castShadow receiveShadow geometry={nodes.Object_14.geometry} material={materials["Material.002"]} />
          <mesh castShadow receiveShadow geometry={nodes.Object_15.geometry} material={materials["Material.005"]} />
        </group>
      </group>

      <Text position={[1.5, 1.6, 0]} color="#1a1a1a" fontSize={0.18} font="NotoSans-Regular.ttf" letterSpacing={-0.05}
        outlineWidth={0.007} outlineColor="#ffffff">
        {displayName}
      </Text>
      <Price value={priceEur} currency="€" position={pricePos} />
    </>
  )
}

useGLTF.preload("/room-transformed.glb")
