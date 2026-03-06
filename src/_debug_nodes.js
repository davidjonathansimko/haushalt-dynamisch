// Temp debug script — run in browser console after loading the GLB
import { useGLTF } from "@react-three/drei"
const { nodes } = useGLTF("/room2to8/room3/cozy_living_room_baked-draco.glb")
console.log("ALL NODE KEYS:", Object.keys(nodes))
