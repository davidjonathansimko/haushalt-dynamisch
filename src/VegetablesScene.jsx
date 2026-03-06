import { useState, useCallback, useMemo, useEffect } from "react"
import { debounce } from "lodash"
import { useGLTF, useEnvironment, Text } from "@react-three/drei"
import { Select } from "@react-three/postprocessing"
import { useThree } from "@react-three/fiber"
import { Price } from "./Price"
import * as THREE from "three"
import { useLang, useTranslations, itemNames } from "./i18n"
import { isTouchDevice } from "./shared"

// Base prices in EUR
const PRICES_EUR = { KÜCHE: 5999, TEPPICH: 433, LAMPE: 77, STÜHLE: 255, TISCH: 1699, VASE: 44, COUCH: 899, WANDLAMPE: 129 }

export function VegetablesScene(props) {
  const { nodes, materials } = useGLTF("/kitchen-transformed.glb")
  const couch = useGLTF("/couch-draco.glb")
  const wallLamp = useGLTF("/wall-lamp-transformed.glb")
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
  const displayName = hovered ? getLocalName(hovered) : t.defaultTitleLiving
  const { size } = useThree()
  const isPortraitMobile = size.width < size.height && size.width < 600
  const pricePos = isPortraitMobile ? [-1.2, 0.6, -3.25] : [-2, 0.3, -3.25]

  // Clone couch scene so it can be reused if needed
  const couchScene = useMemo(() => couch.scene.clone(true), [couch.scene])
  const wallLampScene = useMemo(() => wallLamp.scene.clone(true), [wallLamp.scene])

  // Couch-Material: dunkelbraun Leder mit Reflexionen
  useEffect(() => {
    const leatherMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#1a0e05"),
      roughness: 0.35,
      metalness: 0.0,
      clearcoat: 0.4,
      clearcoatRoughness: 0.3,
      envMap: env,
      envMapIntensity: 0.6,
    })
    const woodMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#bc8764ff"),
      roughness: 0.6,
      metalness: 0.0,
      envMap: env,
      envMapIntensity: 0.3,
    })
    couchScene.traverse((child) => {
      if (child.isMesh) {
        const box = new THREE.Box3().setFromObject(child)
        const height = box.max.y - box.min.y
        const size = box.max.x - box.min.x
        if (height < size * 0.3) {
          child.material = woodMaterial
        } else {
          child.material = leatherMaterial
        }
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    // Cleanup materials on unmount to free GPU memory
    return () => {
      leatherMaterial.dispose()
      woodMaterial.dispose()
    }
  }, [couchScene, env])

  return (
    <>
      <group {...props}>
        {/* ===== Dekoration (nicht interaktiv) ===== */}
        <mesh geometry={nodes.vase1.geometry} material={materials.gray} material-envMap={env} />
        <mesh geometry={nodes.bottle.geometry} material={materials.gray} material-envMap={env} />
        <mesh geometry={nodes.walls_1.geometry} material={materials.floor} />
        <mesh geometry={nodes.walls_2.geometry} material={materials.walls} />
        <mesh geometry={nodes.plant_1.geometry} material={materials.potted_plant_01_leaves} />
        <mesh geometry={nodes.plant_2.geometry} material={materials.potted_plant_01_pot} />
        <mesh geometry={nodes.cuttingboard.geometry} material={materials.walls} />
        <mesh geometry={nodes.bowl.geometry} material={materials.walls} />
        <mesh geometry={nodes.kitchen.geometry} material={materials.walls} />
        <mesh geometry={nodes.sink.geometry} material={materials.chrome} material-envMap={env} />

        {/* ===== Interaktive Objekte mit Preisen ===== */}
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

        {/* ===== COUCH ===== */}
        <Select enabled={hovered === "COUCH"} onPointerOver={over("COUCH")} onPointerOut={out} onClick={tap("COUCH")}>
          <primitive
            object={couchScene}
            position={[0.5, -0.03, 3.2]}
            scale={0.0014}
            rotation={[0, Math.PI, 0]}
          />
        </Select>

        {/* ===== WANDLAMPE ===== */}
        <Select enabled={hovered === "WANDLAMPE"} onPointerOver={over("WANDLAMPE")} onPointerOut={out} onClick={tap("WANDLAMPE")}>
          <primitive
            object={wallLampScene}
            position={[2.0, 2.0, 3.7]}
            scale={1.6}
            rotation={[0, Math.PI / -1, 0]}
          />
        </Select>

      </group>

      <Text position={[1, 1.25, 0]} color="#1a1a1a" fontSize={0.15} font="NotoSans-Regular.ttf" letterSpacing={-0.05}
        outlineWidth={0.006} outlineColor="#ffffff">
        {displayName}
      </Text>
      <Price value={priceEur} currency="€" position={pricePos} />
    </>
  )
}

// Preload all models
useGLTF.preload("/kitchen-transformed.glb")
useGLTF.preload("/couch-draco.glb")
useGLTF.preload("/wall-lamp-transformed.glb")
