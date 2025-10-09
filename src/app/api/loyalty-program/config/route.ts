import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface LoyaltyProgram {
  id: string
  name: string
  description: string
  isActive: boolean
  pointsPerEuro: number
  minimumRedemption: number
  expirationMonths: number
  tiers: LoyaltyTier[]
  rewards: LoyaltyReward[]
  rules: LoyaltyRule[]
}

interface LoyaltyTier {
  id: string
  name: string
  minPoints: number
  benefits: string[]
  color: string
  icon: string
  multiplier: number
  perks: {
    freeShipping: boolean
    prioritySupport: boolean
    exclusiveOffers: boolean
    birthdayBonus: number
  }
}

interface LoyaltyReward {
  id: string
  name: string
  description: string
  pointsCost: number
  type: 'discount' | 'product' | 'shipping' | 'experience'
  value: number
  isActive: boolean
  category: string
  image?: string
  limitPerCustomer?: number
  validUntil?: string
}

interface LoyaltyRule {
  id: string
  action: string
  points: number
  description: string
  isActive: boolean
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'unlimited'
}

// GET loyalty program configuration
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Mock loyalty program configuration
    const loyaltyProgram: LoyaltyProgram = {
      id: "loyalty-1",
      name: "Lovilike Rewards",
      description: "Programa de fidelización para clientes de Lovilike",
      isActive: true,
      pointsPerEuro: 10, // 10 puntos por cada euro gastado
      minimumRedemption: 100, // Mínimo 100 puntos para canjear
      expirationMonths: 24, // Los puntos caducan en 24 meses
      tiers: [
        {
          id: "bronze",
          name: "Bronce",
          minPoints: 0,
          benefits: [
            "Puntos en cada compra",
            "Ofertas especiales",
            "Notificaciones de nuevos productos"
          ],
          color: "#CD7F32",
          icon: "bronze",
          multiplier: 1,
          perks: {
            freeShipping: false,
            prioritySupport: false,
            exclusiveOffers: false,
            birthdayBonus: 50
          }
        },
        {
          id: "silver",
          name: "Plata",
          minPoints: 500,
          benefits: [
            "1.2x puntos en cada compra",
            "Envío gratis en pedidos >50€",
            "Acceso anticipado a ofertas",
            "Soporte prioritario"
          ],
          color: "#C0C0C0",
          icon: "silver",
          multiplier: 1.2,
          perks: {
            freeShipping: true,
            prioritySupport: true,
            exclusiveOffers: true,
            birthdayBonus: 100
          }
        },
        {
          id: "gold",
          name: "Oro",
          minPoints: 1500,
          benefits: [
            "1.5x puntos en cada compra",
            "Envío gratis en todos los pedidos",
            "Productos exclusivos",
            "Descuentos especiales",
            "Soporte VIP"
          ],
          color: "#FFD700",
          icon: "gold",
          multiplier: 1.5,
          perks: {
            freeShipping: true,
            prioritySupport: true,
            exclusiveOffers: true,
            birthdayBonus: 200
          }
        },
        {
          id: "platinum",
          name: "Platino",
          minPoints: 5000,
          benefits: [
            "2x puntos en cada compra",
            "Envío express gratuito",
            "Diseños exclusivos",
            "Consultor personal",
            "Eventos VIP",
            "Regalos de cumpleaños"
          ],
          color: "#E5E4E2",
          icon: "platinum",
          multiplier: 2,
          perks: {
            freeShipping: true,
            prioritySupport: true,
            exclusiveOffers: true,
            birthdayBonus: 500
          }
        }
      ],
      rewards: [
        {
          id: "discount-5",
          name: "5% Descuento",
          description: "Descuento del 5% en tu próxima compra",
          pointsCost: 100,
          type: "discount",
          value: 5,
          isActive: true,
          category: "Descuentos",
          limitPerCustomer: 1
        },
        {
          id: "discount-10",
          name: "10% Descuento",
          description: "Descuento del 10% en tu próxima compra",
          pointsCost: 200,
          type: "discount",
          value: 10,
          isActive: true,
          category: "Descuentos",
          limitPerCustomer: 1
        },
        {
          id: "discount-15",
          name: "15% Descuento",
          description: "Descuento del 15% en tu próxima compra",
          pointsCost: 300,
          type: "discount",
          value: 15,
          isActive: true,
          category: "Descuentos",
          limitPerCustomer: 1
        },
        {
          id: "free-shipping",
          name: "Envío Gratuito",
          description: "Envío gratis en tu próxima compra",
          pointsCost: 150,
          type: "shipping",
          value: 0,
          isActive: true,
          category: "Envíos"
        },
        {
          id: "express-shipping",
          name: "Envío Express",
          description: "Envío express en 24h",
          pointsCost: 250,
          type: "shipping",
          value: 0,
          isActive: true,
          category: "Envíos"
        },
        {
          id: "tshirt-premium",
          name: "Camiseta Premium",
          description: "Camiseta personalizada premium",
          pointsCost: 800,
          type: "product",
          value: 35,
          isActive: true,
          category: "Productos",
          image: "/products/tshirt-premium.jpg"
        },
        {
          id: "mug-ceramic",
          name: "Taza Cerámica",
          description: "Taza de cerámica personalizada",
          pointsCost: 500,
          type: "product",
          value: 20,
          isActive: true,
          category: "Productos",
          image: "/products/mug-ceramic.jpg"
        },
        {
          id: "design-consultation",
          name: "Consulta de Diseño",
          description: "Sesión personalizada con nuestro equipo de diseño",
          pointsCost: 1000,
          type: "experience",
          value: 0,
          isActive: true,
          category: "Experiencias",
          limitPerCustomer: 2
        },
        {
          id: "vip-event",
          name: "Evento VIP",
          description: "Invitación a evento exclusivo de Lovilike",
          pointsCost: 2000,
          type: "experience",
          value: 0,
          isActive: true,
          category: "Experiencias",
          limitPerCustomer: 1
        }
      ],
      rules: [
        {
          id: "purchase-points",
          action: "Realizar compra",
          points: 10,
          description: "Gana 10 puntos por cada euro gastado",
          isActive: true,
          frequency: "unlimited"
        },
        {
          id: "first-purchase",
          action: "Primera compra",
          points: 100,
          description: "Bonus de bienvenida por tu primera compra",
          isActive: true,
          frequency: "once"
        },
        {
          id: "review-product",
          action: "Escribir reseña",
          points: 25,
          description: "Gana puntos por escribir reseñas de productos",
          isActive: true,
          frequency: "unlimited"
        },
        {
          id: "social-share",
          action: "Compartir en redes sociales",
          points: 15,
          description: "Comparte tus compras en redes sociales",
          isActive: true,
          frequency: "daily"
        },
        {
          id: "birthday-bonus",
          action: "Cumpleaños",
          points: 100,
          description: "Bonus especial en tu cumpleaños",
          isActive: true,
          frequency: "once"
        },
        {
          id: "referral-friend",
          action: "Referir amigo",
          points: 200,
          description: "Gana puntos cuando un amigo hace su primera compra",
          isActive: true,
          frequency: "unlimited"
        }
      ]
    }

    return NextResponse.json(loyaltyProgram)

  } catch (error) {
    console.error("Error fetching loyalty program:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST - Update loyalty program configuration
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const programData = await request.json()

    // In a real implementation, you would:
    // 1. Validate the program configuration
    // 2. Update the database
    // 3. Trigger notifications to existing customers if changes affect them
    // 4. Update any cached data

    console.log('Saving loyalty program config:', {
      id: programData.id,
      name: programData.name,
      isActive: programData.isActive,
      pointsPerEuro: programData.pointsPerEuro,
      tiersCount: programData.tiers?.length || 0,
      rewardsCount: programData.rewards?.length || 0
    })

    // Simulate successful save
    return NextResponse.json({
      success: true,
      message: "Programa de fidelización actualizado correctamente"
    })

  } catch (error) {
    console.error("Error updating loyalty program:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}