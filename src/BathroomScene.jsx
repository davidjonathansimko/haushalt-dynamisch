import { useState, useCallback, useEffect } from "react"
import { debounce } from "lodash"
import { useGLTF, Text } from "@react-three/drei"
import { Select } from "@react-three/postprocessing"
import { useThree } from "@react-three/fiber"
import { Price } from "./Price"
import { useLang, useTranslations, itemNames } from "./i18n"
import { isTouchDevice } from "./shared"

// Base prices in EUR
const PRICES_EUR = {
  BADEWANNE: 2499,
  WASCHBECKEN: 899,
  SPIEGEL: 349,
  DUSCHE: 1899,
  SCHRANK: 1199,
  HANDTUCHHALTER: 79,
  TEPPICH: 149,
  PFLANZE: 59,
  BELEUCHTUNG: 199,
}

const GLB_PATH = "/room2to8/room4/cozy_bathroom_design-draco.glb"

export function BathroomScene(props) {
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
  const priceEur = PRICES_EUR[hovered] ?? 2499
  const displayName = hovered ? getLocalName(hovered) : t.defaultTitleBathroom
  const { size } = useThree()
  const isPortraitMobile = size.width < size.height && size.width < 600
  const pricePos = isPortraitMobile ? [-1.2, 0.6, -3.25] : [-2, 0.3, -3.25]

  return (
    <>
      <group {...props}>
        <group scale={0.01}>
          {/* ===== Non-interactive: walls, floor, structure, ivy, misc ===== */}
          <mesh geometry={nodes['Cube_wall-dec_0'].geometry} material={materials['wall-dec']} />
          <mesh geometry={nodes['Cube_Ceramic Holes Dents_0'].geometry} material={materials['Ceramic_Holes_Dents']} />
          <mesh geometry={nodes['Cube_window-glass_0'].geometry} material={materials['window-glass']} />
          {nodes['Cube.001_\u043c\u0430\u0442\u0435\u0440\u04564_0'] && (
            <mesh geometry={nodes['Cube.001_\u043c\u0430\u0442\u0435\u0440\u04564_0'].geometry} material={nodes['Cube.001_\u043c\u0430\u0442\u0435\u0440\u04564_0'].material} />
          )}
          <mesh geometry={nodes['Cube.003__0'].geometry} material={materials['Cube.003__0']} />
          <mesh geometry={nodes['Cube.004__0'].geometry} material={materials['Cube.003__0']} />
          {/* Wall tiles */}
          <mesh geometry={nodes['Cube.011_Ceramic Dots_0'].geometry} material={materials['Ceramic_Dots']} />
          <mesh geometry={nodes['Cube.012_Ceramic Dots_0'].geometry} material={materials['Ceramic_Dots']} />
          {/* Faucets / taps */}
          {nodes['Cube.013_Material.010_0'] && <mesh geometry={nodes['Cube.013_Material.010_0'].geometry} material={materials['Material.010']} />}
          {nodes['Cube.013_Material.009_0'] && <mesh geometry={nodes['Cube.013_Material.009_0'].geometry} material={materials['Material.009']} />}
          {nodes['Cube.013_Material.014_0'] && <mesh geometry={nodes['Cube.013_Material.014_0'].geometry} material={materials['Material.014']} />}
          {nodes['Cylinder_Material.008_0'] && <mesh geometry={nodes['Cylinder_Material.008_0'].geometry} material={materials['Material.008']} />}
          {nodes['Cube.015_Material.011_0'] && <mesh geometry={nodes['Cube.015_Material.011_0'].geometry} material={materials['Material.011']} />}
          {nodes['Cube.015_Material.007_0'] && <mesh geometry={nodes['Cube.015_Material.007_0'].geometry} material={materials['Material.007']} />}
          {nodes['Cube.015_Material.012_0'] && <mesh geometry={nodes['Cube.015_Material.012_0'].geometry} material={materials['Material.012']} />}
          {nodes['Cylinder.001_Material.008_0'] && <mesh geometry={nodes['Cylinder.001_Material.008_0'].geometry} material={materials['Material.008']} />}
          {/* Countertop */}
          {Object.keys(nodes).filter(k => k.startsWith('Countertop1')).map(k => (
            <mesh key={k} geometry={nodes[k].geometry} material={nodes[k].material} />
          ))}
          {/* Shelf board */}
          {nodes['Cube.007_Ash Wood_0'] && <mesh geometry={nodes['Cube.007_Ash Wood_0'].geometry} material={materials['Ash_Wood']} />}
          {nodes['Cube.008_Walnut_0'] && <mesh geometry={nodes['Cube.008_Walnut_0'].geometry} material={materials['Walnut']} />}
          {/* Misc decoration cubes */}
          {nodes['Cube.016_Material.002_0'] && <mesh geometry={nodes['Cube.016_Material.002_0'].geometry} material={materials['Material.002']} />}
          {nodes['Cube.017_Material.002_0'] && <mesh geometry={nodes['Cube.017_Material.002_0'].geometry} material={materials['Material.002']} />}
          {nodes['Cube.018_Material.002_0'] && <mesh geometry={nodes['Cube.018_Material.002_0'].geometry} material={materials['Material.002']} />}
          {nodes['Cube.019_Material.002_0'] && <mesh geometry={nodes['Cube.019_Material.002_0'].geometry} material={materials['Material.002']} />}
          {nodes['Cube.020_Material.002_0'] && <mesh geometry={nodes['Cube.020_Material.002_0'].geometry} material={materials['Material.002']} />}
          {nodes['Cube.021_Material.002_0'] && <mesh geometry={nodes['Cube.021_Material.002_0'].geometry} material={materials['Material.002']} />}
          {nodes['Cube.024_Material.002_0'] && <mesh geometry={nodes['Cube.024_Material.002_0'].geometry} material={materials['Material.002']} />}
          {/* Pipes and extras */}
          {Object.keys(nodes).filter(k => k.startsWith('Circle.009') || k.startsWith('Circle.010') || k.startsWith('Circle.011') || k.startsWith('Cylinder.002') || k.startsWith('Cylinder.003') || k.startsWith('Cylinder.004') || k.startsWith('Cylinder.005') || k.startsWith('Cylinder.006')).filter(k => nodes[k].geometry).map(k => (
            <mesh key={k} geometry={nodes[k].geometry} material={nodes[k].material} />
          ))}
          {/* Plumbing circles */}
          {Object.keys(nodes).filter(k => /^Circle\.\d{3}_/.test(k) && !k.startsWith('Circle.007') && !k.startsWith('Circle.006') && !k.startsWith('Circle.008')).filter(k => nodes[k].geometry).map(k => (
            <mesh key={k} geometry={nodes[k].geometry} material={nodes[k].material} />
          ))}
          {/* Shower knobs */}
          {nodes['Circle.006_\u043c\u0430\u0442\u0435\u0440\u04311_0'] && <mesh geometry={nodes['Circle.006_\u043c\u0430\u0442\u0435\u0440\u04311_0'].geometry} material={nodes['Circle.006_\u043c\u0430\u0442\u0435\u0440\u04311_0'].material} />}
          {nodes['Circle.007_\u043c\u0430\u0442\u0435\u0440\u04311_0'] && <mesh geometry={nodes['Circle.007_\u043c\u0430\u0442\u0435\u0440\u04311_0'].geometry} material={nodes['Circle.007_\u043c\u0430\u0442\u0435\u0440\u04311_0'].material} />}
          {/* Picture frame */}
          {nodes['Plane.001_\u043c\u0430\u0442\u0435\u0440\u04561_0'] && <mesh geometry={nodes['Plane.001_\u043c\u0430\u0442\u0435\u0440\u04561_0'].geometry} material={nodes['Plane.001_\u043c\u0430\u0442\u0435\u0440\u04561_0'].material} />}
          {/* Towel bar material */}
          {nodes['Cube.022_Material.003_0'] && <mesh geometry={nodes['Cube.022_Material.003_0'].geometry} material={materials['Material.003']} />}
          {nodes['Cube.023_Material.003_0'] && <mesh geometry={nodes['Cube.023_Material.003_0'].geometry} material={materials['Material.003']} />}
          {/* Ivy leaves — rendered as a single group for performance */}
          {Object.keys(nodes).filter(k => (k.includes('IvyLeaf') || k.includes('IVY')) && nodes[k].geometry).slice(0, 50).map(k => (
            <mesh key={k} geometry={nodes[k].geometry} material={nodes[k].material} />
          ))}
        </group>

        {/* ===== Interactive: BADEWANNE (bathtub) ===== */}
        <group scale={0.01}>
          <Select enabled={hovered === "BADEWANNE"} onPointerOver={over("BADEWANNE")} onPointerOut={out} onClick={tap("BADEWANNE")}>
            <mesh geometry={nodes['Cube.002_Marble_0'].geometry} material={materials['Marble']} />
          </Select>
        </group>

        {/* ===== Interactive: WASCHBECKEN (sink) ===== */}
        <group scale={0.01}>
          <Select enabled={hovered === "WASCHBECKEN"} onPointerOver={over("WASCHBECKEN")} onPointerOut={out} onClick={tap("WASCHBECKEN")}>
            <mesh geometry={nodes['Circle.008_Marble_0'].geometry} material={materials['Marble']} />
          </Select>
        </group>

        {/* ===== Interactive: SPIEGEL (mirror) ===== */}
        <group scale={0.01}>
          <Select enabled={hovered === "SPIEGEL"} onPointerOver={over("SPIEGEL")} onPointerOut={out} onClick={tap("SPIEGEL")}>
            {nodes['Cube.009_Ash Wood_0'] && <mesh geometry={nodes['Cube.009_Ash Wood_0'].geometry} material={materials['Ash_Wood']} />}
            {nodes['Cube.009_mirror_0'] && <mesh geometry={nodes['Cube.009_mirror_0'].geometry} material={materials['mirror']} />}
            {nodes['Cube.010_Ash Wood_0'] && <mesh geometry={nodes['Cube.010_Ash Wood_0'].geometry} material={materials['Ash_Wood']} />}
            {nodes['Cube.010_mirror1_0'] && <mesh geometry={nodes['Cube.010_mirror1_0'].geometry} material={materials['mirror1']} />}
          </Select>
        </group>

        {/* ===== Interactive: DUSCHE (shower) ===== */}
        <group scale={0.01}>
          <Select enabled={hovered === "DUSCHE"} onPointerOver={over("DUSCHE")} onPointerOut={out} onClick={tap("DUSCHE")}>
            <mesh geometry={nodes['Cube.005_shower-glass_0'].geometry} material={materials['shower-glass']} />
            <mesh geometry={nodes['Cube.006_shower-glass_0'].geometry} material={materials['shower-glass']} />
            <mesh geometry={nodes['Sphere_shower-glass_0'].geometry} material={materials['shower-glass']} />
            {nodes['Sphere.001_shower-glass_0'] && <mesh geometry={nodes['Sphere.001_shower-glass_0'].geometry} material={materials['shower-glass']} />}
          </Select>
        </group>

        {/* ===== Interactive: SCHRANK (cabinets) ===== */}
        <group scale={0.01}>
          <Select enabled={hovered === "SCHRANK"} onPointerOver={over("SCHRANK")} onPointerOut={out} onClick={tap("SCHRANK")}>
            <mesh geometry={nodes['Cabinet1_Ash Wood_0'].geometry} material={materials['Ash_Wood']} />
            <mesh geometry={nodes['Cabinet2_Ash Wood_0'].geometry} material={materials['Ash_Wood']} />
            <mesh geometry={nodes['Cabinet3_Ash Wood_0'].geometry} material={materials['Ash_Wood']} />
            <mesh geometry={nodes['Cabinet4_Ash Wood_0'].geometry} material={materials['Ash_Wood']} />
            <mesh geometry={nodes['Cabinet5_Ash Wood_0'].geometry} material={materials['Ash_Wood']} />
            {nodes['Cabinet5_Door_Ash Wood_0'] && <mesh geometry={nodes['Cabinet5_Door_Ash Wood_0'].geometry} material={materials['Ash_Wood']} />}
            {nodes['Cabinet5_Door.001_Ash Wood_0'] && <mesh geometry={nodes['Cabinet5_Door.001_Ash Wood_0'].geometry} material={materials['Ash_Wood']} />}
            {nodes['Cabinet5_Door.002_Ash Wood_0'] && <mesh geometry={nodes['Cabinet5_Door.002_Ash Wood_0'].geometry} material={materials['Ash_Wood']} />}
            {nodes['Cabinet5_Door.003_Ash Wood_0'] && <mesh geometry={nodes['Cabinet5_Door.003_Ash Wood_0'].geometry} material={materials['Ash_Wood']} />}
            {nodes['Drawer_Ash Wood_0'] && <mesh geometry={nodes['Drawer_Ash Wood_0'].geometry} material={materials['Ash_Wood']} />}
            {nodes['Drawer.001_Ash Wood_0'] && <mesh geometry={nodes['Drawer.001_Ash Wood_0'].geometry} material={materials['Ash_Wood']} />}
            {nodes['Cube.014_Ash Wood_0'] && <mesh geometry={nodes['Cube.014_Ash Wood_0'].geometry} material={materials['Ash_Wood']} />}
          </Select>
        </group>

        {/* ===== Interactive: HANDTUCHHALTER (towel hanger) ===== */}
        <group scale={0.01}>
          <Select enabled={hovered === "HANDTUCHHALTER"} onPointerOver={over("HANDTUCHHALTER")} onPointerOut={out} onClick={tap("HANDTUCHHALTER")}>
            {nodes['Round Towel Hanger 2_Round Towel Hanger_Metal_0'] && <mesh geometry={nodes['Round Towel Hanger 2_Round Towel Hanger_Metal_0'].geometry} material={materials['Round_Towel_Hanger_Metal']} />}
            {Object.keys(nodes).filter(k => k.includes('Round Towel Hanger 2_Round Towel Hanger_Fabric')).filter(k => nodes[k].geometry).map(k => (
              <mesh key={k} geometry={nodes[k].geometry} material={materials['Round_Towel_Hanger_Fabric']} />
            ))}
          </Select>
        </group>

        {/* ===== Interactive: TEPPICH (carpet / bath mat) ===== */}
        <group scale={0.01}>
          <Select enabled={hovered === "TEPPICH"} onPointerOver={over("TEPPICH")} onPointerOut={out} onClick={tap("TEPPICH")}>
            <mesh geometry={nodes['Plane_carpet_0'].geometry} material={materials['carpet']} />
          </Select>
        </group>

        {/* ===== Interactive: PFLANZE (plants) ===== */}
        <group scale={0.01}>
          <Select enabled={hovered === "PFLANZE"} onPointerOver={over("PFLANZE")} onPointerOut={out} onClick={tap("PFLANZE")}>
            {nodes['sansevieriapot_Material.006_0'] && <mesh geometry={nodes['sansevieriapot_Material.006_0'].geometry} material={materials['Material.006']} />}
            {nodes['sansevieriaplant_Material.013_0'] && <mesh geometry={nodes['sansevieriaplant_Material.013_0'].geometry} material={materials['Material.013']} />}
            {nodes['sansevieriagravel_Material.005_0'] && <mesh geometry={nodes['sansevieriagravel_Material.005_0'].geometry} material={materials['Material.005']} />}
            {/* Succulent plant */}
            {Object.keys(nodes).filter(k => k.startsWith('Plane.005_Plant_Leaf')).filter(k => nodes[k].geometry).map(k => (
              <mesh key={k} geometry={nodes[k].geometry} material={nodes[k].material} />
            ))}
            {nodes['Circle.012_Plant_Pot_0'] && <mesh geometry={nodes['Circle.012_Plant_Pot_0'].geometry} material={materials['Plant_Pot']} />}
            {nodes['Circle.012_Plant_Soil_0'] && <mesh geometry={nodes['Circle.012_Plant_Soil_0'].geometry} material={materials['Plant_Soil']} />}
            {nodes['Plane.003_Plant Stem.001_0'] && <mesh geometry={nodes['Plane.003_Plant Stem.001_0'].geometry} material={materials['Plant_Stem.001']} />}
            {nodes['Circle.014_Plant Leaf.001_0'] && <mesh geometry={nodes['Circle.014_Plant Leaf.001_0'].geometry} material={materials['Plant_Leaf.001']} />}
          </Select>
        </group>

        {/* ===== Interactive: BELEUCHTUNG (lighting) ===== */}
        <group scale={0.01}>
          <Select enabled={hovered === "BELEUCHTUNG"} onPointerOver={over("BELEUCHTUNG")} onPointerOut={out} onClick={tap("BELEUCHTUNG")}>
            {Object.keys(nodes).filter(k => k.includes('Led light bulb')).filter(k => nodes[k].geometry).map(k => (
              <mesh key={k} geometry={nodes[k].geometry} material={nodes[k].material} />
            ))}
          </Select>
        </group>
      </group>

      <Text position={[1, 1.25, 0]} color="#1a1a1a" fontSize={0.15} font="NotoSans-Regular.ttf" letterSpacing={-0.05}
        outlineWidth={0.006} outlineColor="#ffffff">
        {displayName}
      </Text>
      <Price value={priceEur} currency="€" position={pricePos} />
    </>
  )
}

useGLTF.preload(GLB_PATH)
