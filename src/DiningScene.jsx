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
  ESSTISCH: 1899,
  STUHL: 349,
  TEPPICH: 589,
  BELEUCHTUNG: 429,
  BILD: 199,
  BLUMEN: 65,
  SCHRANK: 1299,
  FENSTER: 799,
}

const GLB_PATH = "/room2to8/room2/dining_room__kichen_baked.glb"

export function DiningScene(props) {
  const { nodes, materials } = useGLTF(GLB_PATH)
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
  const priceEur = PRICES_EUR[hovered] ?? 1899
  const displayName = hovered ? getLocalName(hovered) : t.defaultTitleDining
  const { size } = useThree()
  const isPortraitMobile = size.width < size.height && size.width < 600
  const pricePos = isPortraitMobile ? [-1.2, 0.6, -3.25] : [-2, 0.3, -3.25]

  return (
    <>
      <group {...props}>
        <group scale={0.01}>
          {/* ===== Non-interactive decoration ===== */}
          <mesh geometry={nodes.house_Material009_0.geometry} material={materials['Material.009']} position={[0, 151.309, -0.282]} rotation={[-Math.PI / 2, 0, 0]} scale={[396.176, 396.176, 150]} />
          <mesh geometry={nodes.floor_floor_0.geometry} material={materials.floor} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
          <mesh geometry={nodes.faucet_Material006_0.geometry} material={materials['Material.006']} position={[392.071, 95.046, 141.652]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.204, 0.204, 1.555]} />
          <mesh geometry={nodes.bowl_grey_0.geometry} material={materials.grey} position={[372.827, 99.081, 270.913]} rotation={[-Math.PI / 2, 0, 0]} scale={[16.524, 16.524, 12.674]} />
          <mesh geometry={nodes.chopping_board1_Material1_0.geometry} material={materials.Material1} position={[388.318, 97.913, 187.245]} rotation={[-1.593, -1.28, -0.023]} scale={[1.332, 1.546, 1.332]} />
          <mesh geometry={nodes.chopping_board2_Material2_0.geometry} material={materials.Material2} position={[391.595, 98.773, 194.446]} rotation={[-1.6, -1.347, -0.03]} scale={[1.399, 1.586, 1.399]} />
          <mesh geometry={nodes.jar1_Material3_0.geometry} material={materials.Material3} position={[375.22, 92.792, -108.769]} rotation={[-Math.PI / 2, 0, -1.875]} scale={0.898} />
          <mesh geometry={nodes.jar2_Material4_0.geometry} material={materials.Material4} position={[372.586, 97.235, -121.78]} rotation={[-Math.PI / 2, 0, -1.247]} scale={0.824} />
          <mesh geometry={nodes.jar3_Material002_0.geometry} material={materials['Material.002']} position={[383.419, 94.983, 239.01]} rotation={[-Math.PI / 2, 0, 0]} scale={8.337} />
          <mesh geometry={nodes.jar4_Material017_0.geometry} material={materials['Material.017']} position={[377.036, 94.34, 219.292]} rotation={[-Math.PI / 2, 0, 0]} scale={7.771} />
          <group position={[366.217, 115.97, -143.771]} rotation={[-Math.PI / 2, 0, 0]} scale={3.789}>
            <mesh geometry={nodes.candle_Material013_0.geometry} material={materials['Material.013']} />
            <mesh geometry={nodes.candle_Material008_0.geometry} material={materials['Material.008']} />
            <mesh geometry={nodes.candle_Material007_0.geometry} material={materials['Material.007']} />
          </group>
          <mesh geometry={nodes.IKEA_seat_wood__0.geometry} material={materials.wood} position={[363.595, 31.995, -331.439]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} scale={[17.536, 15.514, 15.514]} />

          {/* ===== Interactive: ESSTISCH (dining table) ===== */}
          <Select enabled={hovered === "ESSTISCH"} onPointerOver={over("ESSTISCH")} onPointerOut={out} onClick={tap("ESSTISCH")}>
            <mesh geometry={nodes.table_Material5001_0.geometry} material={materials['Material5.001']} position={[83.1, 65.739, 24.667]} rotation={[-Math.PI / 2, 0, 0]} scale={[80.747, 80.747, 10.763]} />
          </Select>

          {/* ===== Interactive: STUHL (seats) ===== */}
          <Select enabled={hovered === "STUHL"} onPointerOver={over("STUHL")} onPointerOut={out} onClick={tap("STUHL")}>
            <group position={[81.651, 59.793, -127.726]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} scale={[25.257, 25.257, 2.667]}>
              <mesh geometry={nodes.seat_Leather_0.geometry} material={materials.Leather} />
              <mesh geometry={nodes.seat_Material5_0.geometry} material={materials.Material5} />
            </group>
          </Select>

          {/* ===== Interactive: TEPPICH (carpet) ===== */}
          <Select enabled={hovered === "TEPPICH"} onPointerOver={over("TEPPICH")} onPointerOut={out} onClick={tap("TEPPICH")}>
            <mesh geometry={nodes.carpet_Carpet__0.geometry} material={materials.Carpet} position={[81.578, 2.411, 26.536]} rotation={[-Math.PI / 2, 0, 0]} scale={[190.768, 245.015, 0.524]} />
          </Select>

          {/* ===== Interactive: BELEUCHTUNG (pendant lighting) ===== */}
          <Select enabled={hovered === "BELEUCHTUNG"} onPointerOver={over("BELEUCHTUNG")} onPointerOut={out} onClick={tap("BELEUCHTUNG")}>
            <group position={[188.831, 243.457, -26.58]} rotation={[-Math.PI / 2, 0, 0]} scale={[2.688, 2.688, 23.024]}>
              <mesh geometry={nodes.lighting_Material001_0.geometry} material={materials['Material.001']} />
              <mesh geometry={nodes.lighting_Material003_0.geometry} material={materials['Material.003']} />
              <mesh geometry={nodes.lighting_Material014_0.geometry} material={materials['Material.014']} />
            </group>
          </Select>

          {/* ===== Interactive: BILD (painting) ===== */}
          <Select enabled={hovered === "BILD"} onPointerOver={over("BILD")} onPointerOut={out} onClick={tap("BILD")}>
            <group position={[388.469, 117.552, -211.434]} rotation={[-Math.PI / 2, 0.148, 0]} scale={[2.712, 31.279, 31.279]}>
              <mesh geometry={nodes.painting_Material010_0.geometry} material={materials['Material.010']} />
              <mesh geometry={nodes.painting_Material011_0.geometry} material={materials['Material.011']} />
            </group>
          </Select>

          {/* ===== Interactive: BLUMEN (flowers + vase) ===== */}
          <Select enabled={hovered === "BLUMEN"} onPointerOver={over("BLUMEN")} onPointerOut={out} onClick={tap("BLUMEN")}>
            <group position={[85.821, 88.279, 64.486]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
              <mesh geometry={nodes.flower_leaf2_0.geometry} material={materials.leaf2} />
              <mesh geometry={nodes.flower_leaf1_0.geometry} material={materials.leaf1} />
            </group>
            <mesh geometry={nodes.vase_grey001_0.geometry} material={materials['grey.001']} position={[85.258, 86.332, 64.115]} rotation={[-Math.PI / 2, 0, 0]} scale={8.337} />
          </Select>

          {/* ===== Interactive: SCHRANK (cabinet) ===== */}
          <Select enabled={hovered === "SCHRANK"} onPointerOver={over("SCHRANK")} onPointerOut={out} onClick={tap("SCHRANK")}>
            <mesh geometry={nodes.cabinet_Material015_0.geometry} material={materials['Material.015']} position={[367.527, 300.186, 45.941]} rotation={[-Math.PI / 2, 0, 0]} scale={[34.407, 249.171, 3.605]} />
          </Select>

          {/* ===== Interactive: FENSTER (window) ===== */}
          <Select enabled={hovered === "FENSTER"} onPointerOver={over("FENSTER")} onPointerOut={out} onClick={tap("FENSTER")}>
            <mesh geometry={nodes.window_Material016_0.geometry} material={materials['Material.016']} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
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
