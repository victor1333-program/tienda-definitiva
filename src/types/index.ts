import { 
  User, 
  Product, 
  ProductVariant, 
  Order, 
  OrderItem,
  Category,
  Design 
} from '@prisma/client'

export type UserWithOrders = User & {
  orders: Order[]
}

export type ProductWithVariants = Product & {
  variants: ProductVariant[]
  category: Category
  _count: {
    orderItems: number
  }
}

export type OrderWithItems = Order & {
  orderItems: (OrderItem & {
    product: Product
    variant?: ProductVariant | null
    design?: Design | null
  })[]
  user?: User | null
}

export interface CustomizationData {
  text?: {
    content: string
    font: string
    size: number
    color: string
    x: number
    y: number
  }[]
  images?: {
    url: string
    x: number
    y: number
    width: number
    height: number
  }[]
  canvas: {
    width: number
    height: number
    backgroundColor: string
  }
}

export interface CartItem {
  productId: string
  variantId?: string
  quantity: number
  customization?: CustomizationData
  designId?: string
}