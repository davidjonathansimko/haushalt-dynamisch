import { useRef } from "react"
import { easing } from "maath"
import { useFrame, useThree } from "@react-three/fiber"
import { Text, Mask, useMask } from "@react-three/drei"

export const Price = ({ value, currency = "€", ...props }) => {
  const str = String(value)
  const digits = Math.max(4, str.length)
  const padded = [...`${"✨".repeat(digits)}${value}`.slice(-digits)]
  const spacing = 1.1
  const totalWidth = (digits - 1) * spacing
  // Scale down price in portrait mobile so it fits on screen
  const { size } = useThree()
  const isPortrait = size.width < size.height
  const isMobileSize = size.width < 600
  const scale = (isPortrait && isMobileSize) ? 0.55 : 1
  return (
    <group {...props} scale={scale}>
      {padded.map((num, index) => (
        <Counter index={index} value={num === "✨" ? -1 : Number(num)} key={index} speed={0.1 * (digits - index)} />
      ))}
      <Text children={currency} anchorY="bottom" position={[digits * spacing, -0.25, 0]} fontSize={1} font="NotoSans-Regular.ttf"
        color="#ffffff" outlineWidth={0.02} outlineColor="#000000" outlineOpacity={0.35} />
      <Mask id={1} position={[totalWidth / 2, 0, 0]}>
        <planeGeometry args={[totalWidth + 2.5, 2.15]} />
      </Mask>
    </group>
  )
}

function Counter({ index, value, speed = 0.1 }) {
  const ref = useRef()
  const stencil = useMask(1)
  useFrame((state, delta) => easing.damp(ref.current.position, "y", value * -2, speed, delta))
  return (
    <group position-x={index * 1.1} ref={ref}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
        <Text key={number} position={[0, number * 2, 0]} fontSize={2} font="NotoSans-Regular.ttf"
          color="#ffffff" outlineWidth={0.025} outlineColor="#000000" outlineOpacity={0.35}>
          {number}
          <meshBasicMaterial {...stencil} color="#ffffff" />
        </Text>
      ))}
    </group>
  )
}
