import { useState, useCallback, useEffect, useMemo } from "react"
import { debounce } from "lodash"
import { useGLTF, Text } from "@react-three/drei"
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

// Map node name patterns → interactive item key
const INTERACTIVE_RULES = [
  { key: "BADEWANNE",      match: (n) => /Cube[\._]?002.*Marble/i.test(n) },
  { key: "WASCHBECKEN",    match: (n) => /Circle[\._]?008.*Marble/i.test(n) },
  { key: "SPIEGEL",        match: (n) => /Cube[\._]?0(09|10).*mirror/i.test(n) },
  { key: "DUSCHE",         match: (n) => /shower.glass/i.test(n) },
  { key: "SCHRANK",        match: (n) => /Cabinet\d|Drawer|Cabinet5.Door/i.test(n) || /Cube[\._]?014.*Ash/i.test(n) },
  { key: "HANDTUCHHALTER", match: (n) => /Towel.Hanger/i.test(n) },
  { key: "TEPPICH",        match: (n) => /carpet/i.test(n) && /^Plane/i.test(n) },
  { key: "PFLANZE",        match: (n) => /sansevieria|Plant.Leaf|Plant.Pot|Plant.Soil|Plant.Stem|Succulent/i.test(n) },
  { key: "BELEUCHTUNG",    match: (n) => /Led.light.bulb/i.test(n) },
]

function classifyMesh(mesh) {
  // Walk up the hierarchy to find a matching name
  let obj = mesh
  while (obj) {
    for (const rule of INTERACTIVE_RULES) {
      if (rule.match(obj.name)) return rule.key
    }
    obj = obj.parent
  }
  return null
}

export function BathroomScene(props) {
  const { scene, nodes } = useGLTF(GLB_PATH)
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

  // Build a uuid→category map for quick lookup on pointer events
  const categoryMap = useMemo(() => {
    const map = {}
    Object.entries(nodes).forEach(([name, node]) => {
      if (!node.isMesh) return
      for (const rule of INTERACTIVE_RULES) {
        if (rule.match(name)) { map[node.uuid] = rule.key; break }
      }
    })
    return map
  }, [nodes])

  const onPointerOver = useCallback((e) => {
    e.stopPropagation()
    const cat = categoryMap[e.object.uuid] || classifyMesh(e.object)
    if (cat) {
      debouncedHover(cat)
      window.dispatchEvent(new CustomEvent("scene-hover", { detail: cat }))
    }
  }, [categoryMap, debouncedHover])

  const onPointerOut = useCallback(() => {
    debouncedHover(null)
    window.dispatchEvent(new CustomEvent("scene-hover", { detail: null }))
  }, [debouncedHover])

  const onClick = useCallback((e) => {
    e.stopPropagation()
    if (!isTouchDevice()) return
    const cat = categoryMap[e.object.uuid] || classifyMesh(e.object)
    if (cat) {
      hover((prev) => {
        const next = prev === cat ? null : cat
        window.dispatchEvent(new CustomEvent("mobile-select", { detail: next }))
        window.dispatchEvent(new CustomEvent("scene-hover", { detail: next }))
        return next
      })
    }
  }, [categoryMap])

  const getLocalName = (key) => itemNames[lang]?.[key] || key
  const priceEur = PRICES_EUR[hovered] ?? 2499
  const displayName = hovered ? getLocalName(hovered) : t.defaultTitleBathroom
  const { size } = useThree()
  const isPortraitMobile = size.width < size.height && size.width < 600
  const pricePos = isPortraitMobile ? [-1.2, 0.6, -3.25] : [-2, 0.3, -3.25]

  return (
    <>
      <group {...props}>
        <group scale={0.01}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
          onClick={onClick}>
          <primitive object={scene} />
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
