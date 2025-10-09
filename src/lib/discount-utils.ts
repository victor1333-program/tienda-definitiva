import { db as prisma } from '@/lib/db'

// Función para validar descuento (uso público)
export async function validateDiscount(code: string, orderAmount: number) {
  try {
    const discount = await prisma.discount.findFirst({
      where: {
        code,
        isActive: true,
        validFrom: { lte: new Date() },
        OR: [
          { validUntil: null },
          { validUntil: { gte: new Date() } }
        ]
      }
    })

    if (!discount) {
      return { valid: false, error: 'Código de descuento no válido o expirado' }
    }

    // Verificar monto mínimo
    if (discount.minOrderAmount && orderAmount < discount.minOrderAmount) {
      return { 
        valid: false, 
        error: `Monto mínimo requerido: €${discount.minOrderAmount}` 
      }
    }

    // Verificar usos máximos
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return { valid: false, error: 'Descuento agotado' }
    }

    return { valid: true, discount }
  } catch (error) {
    console.error('Error validating discount:', error)
    return { valid: false, error: 'Error al validar descuento' }
  }
}

// Función para aplicar descuento a un pedido
export function applyDiscount(orderAmount: number, discount: any): number {
  switch (discount.type) {
    case 'PERCENTAGE':
      return orderAmount * (discount.value / 100)
    case 'FIXED_AMOUNT':
      return Math.min(discount.value, orderAmount)
    case 'FREE_SHIPPING':
      return 0 // Este descuento se aplica al costo de envío, no al total
    default:
      return 0
  }
}

// Función para marcar descuento como usado
export async function markDiscountAsUsed(discountCode: string) {
  try {
    await prisma.discount.update({
      where: { code: discountCode },
      data: {
        usedCount: {
          increment: 1
        }
      }
    })
    return true
  } catch (error) {
    console.error('Error marking discount as used:', error)
    return false
  }
}