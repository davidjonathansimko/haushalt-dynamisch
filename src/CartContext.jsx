import { createContext, useContext, useReducer, useEffect } from "react"

const CartContext = createContext()

const STORAGE_KEY = "haushalt-cart"

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const exists = state.find((i) => i.name === action.item.name)
      if (exists) return state.map((i) => i.name === action.item.name ? { ...i, qty: i.qty + 1 } : i)
      return [...state, { ...action.item, qty: 1 }]
    }
    case "REMOVE":
      return state.filter((i) => i.name !== action.name)
    case "DEC": {
      const item = state.find((i) => i.name === action.name)
      if (!item) return state
      if (item.qty <= 1) return state.filter((i) => i.name !== action.name)
      return state.map((i) => i.name === action.name ? { ...i, qty: i.qty - 1 } : i)
    }
    case "CLEAR":
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, null, loadCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  return (
    <CartContext.Provider value={{ cart, dispatch }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}

export function cartTotal(cart) {
  return cart.reduce((sum, i) => sum + i.priceEur * i.qty, 0)
}

export function cartCount(cart) {
  return cart.reduce((sum, i) => sum + i.qty, 0)
}
