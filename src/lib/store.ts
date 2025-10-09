import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  variantId?: string
  name: string
  variant?: string
  price: number
  quantity: number
  image?: string
  size?: string
  color?: string
  customization?: string
  customizationFile?: string
  customDesignId?: string
  isCustomized?: boolean
  stockReserved?: boolean
  reservationExpires?: Date
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  markItemReserved: (id: string, expiresAt: Date) => void
  markItemUnreserved: (id: string) => void
  getUnreservedItems: () => CartItem[]
  getExpiredReservations: () => CartItem[]
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (item) => {
        const id = `${item.productId}-${item.variantId || 'default'}-${Date.now()}`
        set((state) => ({
          items: [...state.items, { ...item, id }]
        }))
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id)
        }))
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          )
        }))
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }))
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },

      markItemReserved: (id, expiresAt) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id 
              ? { ...item, stockReserved: true, reservationExpires: expiresAt }
              : item
          )
        }))
      },

      markItemUnreserved: (id) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id 
              ? { ...item, stockReserved: false, reservationExpires: undefined }
              : item
          )
        }))
      },

      getUnreservedItems: () => {
        return get().items.filter(item => !item.stockReserved)
      },

      getExpiredReservations: () => {
        const now = new Date()
        return get().items.filter(item => 
          item.stockReserved && 
          item.reservationExpires && 
          new Date(item.reservationExpires) < now
        )
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)

// Auth Store for client-side user management
export interface User {
  id: string
  name: string
  email: string
  role?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  isActive: boolean
  createdAt: string
}

interface AuthStore {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  updateUser: (userData: Partial<User>) => void
  clearUser: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      setUser: (user) => set({ user, isLoading: false }),
      
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        }))
      },
      
      clearUser: () => set({ user: null, isLoading: false }),
      
      setLoading: (isLoading) => set({ isLoading })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
)

// Legacy user store for backward compatibility
interface UserStore {
  user: unknown | null
  setUser: (user: unknown | null) => void
  clearUser: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))