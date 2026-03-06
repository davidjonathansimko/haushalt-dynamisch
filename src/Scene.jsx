import { useState, useCallback, useEffect } from "react"
import { debounce } from "lodash"
import { useGLTF, useEnvironment, Text } from "@react-three/drei"
import { Select } from "@react-three/postprocessing"
import { useThree } from "@react-three/fiber"
import { Price } from "./Price"
import { useLang, useTranslations, itemNames } from "./i18n"
import { isTouchDevice } from "./shared"

// Base prices in EUR
const PRICES_EUR = { KÜCHE: 5999, TEPPICH: 433, LAMPE: 77, STÜHLE: 255, TISCH: 1699, VASE: 44 }

export function Scene(props) {
  const { nodes, materials } = useGLTF("/kitchen-transformed.glb")
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
  const priceEur = PRICES_EUR[hovered] ?? 5999
  const displayName = hovered ? getLocalName(hovered) : t.defaultTitle
  const { size } = useThree()
  const isPortraitMobile = size.width < size.height && size.width < 600
  const pricePos = isPortraitMobile ? [-1.2, 0.6, -3.25] : [-2, 0.3, -3.25]
  return (
    <>
      <group {...props}>
        <mesh geometry={nodes.vase1.geometry} material={materials.gray} material-envMap={env} />
        <mesh geometry={nodes.bottle.geometry} material={materials.gray} material-envMap={env} />
        <mesh geometry={nodes.walls_1.geometry} material={materials.floor} />
        <mesh geometry={nodes.walls_2.geometry} material={materials.walls} />
        <mesh geometry={nodes.plant_1.geometry} material={materials.potted_plant_01_leaves} />
        <mesh geometry={nodes.plant_2.geometry} material={materials.potted_plant_01_pot} />
        <mesh geometry={nodes.cuttingboard.geometry} material={materials.walls} />
        <mesh geometry={nodes.bowl.geometry} material={materials.walls} />
        <Select enabled={hovered === "TEPPICH"} onPointerOver={over("TEPPICH")} onPointerOut={out} onClick={tap("TEPPICH")}>
          <mesh geometry={nodes.carpet.geometry} material={materials.carpet} />
        </Select>
        <Select enabled={hovered === "TISCH"} onPointerOver={over("TISCH")} onPointerOut={out} onClick={tap("TISCH")}>
          <mesh geometry={nodes.table.geometry} material={materials.walls} material-envMap={env} material-envMapIntensity={0.5} />
        </Select>
        <Select enabled={hovered === "STÜHLE"} onPointerOver={over("STÜHLE")} onPointerOut={out} onClick={tap("STÜHLE")}>
          <mesh geometry={nodes.chairs_1.geometry} material={materials.walls} />
          <mesh geometry={nodes.chairs_2.geometry} material={materials.plastic} material-color="#1a1a1a" material-envMap={env} />
        </Select>
        <Select enabled={hovered === "VASE"} onPointerOver={over("VASE")} onPointerOut={out} onClick={tap("VASE")}>
          <mesh geometry={nodes.vase.geometry} material={materials.gray} material-envMap={env} />
        </Select>
        <Select enabled={hovered === "LAMPE"} onPointerOver={over("LAMPE")} onPointerOut={out} onClick={tap("LAMPE")}>
          <mesh geometry={nodes.lamp_socket.geometry} material={materials.gray} material-envMap={env} />
          <mesh geometry={nodes.lamp.geometry} material={materials.gray} />
          <mesh geometry={nodes.lamp_cord.geometry} material={materials.gray} material-envMap={env} />
        </Select>
        <mesh geometry={nodes.kitchen.geometry} material={materials.walls} />
        <mesh geometry={nodes.sink.geometry} material={materials.chrome} material-envMap={env} />
      </group>
      <Text position={[1, 1.25, 0]} color="#1a1a1a" fontSize={0.15} font="NotoSans-Regular.ttf" letterSpacing={-0.05}
        outlineWidth={0.006} outlineColor="#ffffff">
        {displayName}
      </Text>
      <Price value={priceEur} currency="€" position={pricePos} />
    </>
  )
}

useGLTF.preload("/kitchen-transformed.glb")
