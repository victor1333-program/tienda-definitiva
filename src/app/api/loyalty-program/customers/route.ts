import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface CustomerLoyalty {
  id: string
  customerName: string
  customerEmail: string
  totalPoints: number
  availablePoints: number
  currentTier: string
  nextTier?: string
  pointsToNextTier?: number
  joinDate: string
  lastActivity: string
  lifetimeSpent: number
  rewardsRedeemed: number
  tierHistory: {
    tier: string
    achievedDate: string
  }[]
  pointsHistory: {
    date: string
    points: number
    action: string
    description: string
  }[]
}

// GET loyalty program customers
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Mock customer loyalty data
    const customers: CustomerLoyalty[] = [
      {
        id: "cust-1",
        customerName: "María González",
        customerEmail: "maria.gonzalez@email.com",
        totalPoints: 2847,
        availablePoints: 1247,
        currentTier: "Oro",
        nextTier: "Platino",
        pointsToNextTier: 2153,
        joinDate: "2023-03-15",
        lastActivity: "2024-12-20",
        lifetimeSpent: 1289.50,
        rewardsRedeemed: 8,
        tierHistory: [
          { tier: "Bronce", achievedDate: "2023-03-15" },
          { tier: "Plata", achievedDate: "2023-07-22" },
          { tier: "Oro", achievedDate: "2024-02-10" }
        ],
        pointsHistory: [
          {
            date: "2024-12-20",
            points: 125,
            action: "purchase",
            description: "Compra #ORD-2024-1156 - Camisetas personalizadas"
          },
          {
            date: "2024-12-18",
            points: -200,
            action: "redemption",
            description: "Canje: 10% descuento"
          },
          {
            date: "2024-12-15",
            points: 25,
            action: "review",
            description: "Reseña de producto: Taza cerámica"
          }
        ]
      },
      {
        id: "cust-2",
        customerName: "Carlos Ruiz",
        customerEmail: "carlos.ruiz@email.com",
        totalPoints: 1854,
        availablePoints: 1854,
        currentTier: "Oro",
        pointsToNextTier: 3146,
        joinDate: "2023-06-08",
        lastActivity: "2024-12-19",
        lifetimeSpent: 892.30,
        rewardsRedeemed: 3,
        tierHistory: [
          { tier: "Bronce", achievedDate: "2023-06-08" },
          { tier: "Plata", achievedDate: "2023-11-14" },
          { tier: "Oro", achievedDate: "2024-05-22" }
        ],
        pointsHistory: [
          {
            date: "2024-12-19",
            points: 89,
            action: "purchase",
            description: "Compra #ORD-2024-1155 - Gorra personalizada"
          },
          {
            date: "2024-12-10",
            points: 15,
            action: "social_share",
            description: "Compartir en Instagram"
          }
        ]
      },
      {
        id: "cust-3",
        customerName: "Ana López",
        customerEmail: "ana.lopez@email.com",
        totalPoints: 687,
        availablePoints: 537,
        currentTier: "Plata",
        nextTier: "Oro",
        pointsToNextTier: 813,
        joinDate: "2023-09-12",
        lastActivity: "2024-12-17",
        lifetimeSpent: 456.80,
        rewardsRedeemed: 2,
        tierHistory: [
          { tier: "Bronce", achievedDate: "2023-09-12" },
          { tier: "Plata", achievedDate: "2024-01-28" }
        ],
        pointsHistory: [
          {
            date: "2024-12-17",
            points: 67,
            action: "purchase",
            description: "Compra #ORD-2024-1154 - Bolsa ecológica"
          },
          {
            date: "2024-12-05",
            points: -150,
            action: "redemption",
            description: "Canje: Envío gratuito"
          }
        ]
      },
      {
        id: "cust-4",
        customerName: "Luis Martín",
        customerEmail: "luis.martin@email.com",
        totalPoints: 6234,
        availablePoints: 4234,
        currentTier: "Platino",
        joinDate: "2022-11-03",
        lastActivity: "2024-12-21",
        lifetimeSpent: 2156.70,
        rewardsRedeemed: 15,
        tierHistory: [
          { tier: "Bronce", achievedDate: "2022-11-03" },
          { tier: "Plata", achievedDate: "2023-02-18" },
          { tier: "Oro", achievedDate: "2023-08-05" },
          { tier: "Platino", achievedDate: "2024-03-12" }
        ],
        pointsHistory: [
          {
            date: "2024-12-21",
            points: 198,
            action: "purchase",
            description: "Compra #ORD-2024-1157 - Set regalos corporativos"
          },
          {
            date: "2024-12-19",
            points: -500,
            action: "redemption",
            description: "Canje: Taza cerámica personalizada"
          },
          {
            date: "2024-12-15",
            points: 200,
            action: "referral",
            description: "Referencia: Nuevo cliente registrado"
          }
        ]
      },
      {
        id: "cust-5",
        customerName: "Carmen Jiménez",
        customerEmail: "carmen.jimenez@email.com",
        totalPoints: 1285,
        availablePoints: 1085,
        currentTier: "Plata",
        nextTier: "Oro",
        pointsToNextTier: 215,
        joinDate: "2023-12-20",
        lastActivity: "2024-12-16",
        lifetimeSpent: 678.40,
        rewardsRedeemed: 4,
        tierHistory: [
          { tier: "Bronce", achievedDate: "2023-12-20" },
          { tier: "Plata", achievedDate: "2024-04-08" }
        ],
        pointsHistory: [
          {
            date: "2024-12-16",
            points: 125,
            action: "purchase",
            description: "Compra #ORD-2024-1153 - Mousepad gaming"
          },
          {
            date: "2024-12-14",
            points: -200,
            action: "redemption",
            description: "Canje: 10% descuento"
          }
        ]
      },
      {
        id: "cust-6",
        customerName: "Pedro Castillo",
        customerEmail: "pedro.castillo@email.com",
        totalPoints: 342,
        availablePoints: 342,
        currentTier: "Bronce",
        nextTier: "Plata",
        pointsToNextTier: 158,
        joinDate: "2024-08-15",
        lastActivity: "2024-12-14",
        lifetimeSpent: 234.20,
        rewardsRedeemed: 0,
        tierHistory: [
          { tier: "Bronce", achievedDate: "2024-08-15" }
        ],
        pointsHistory: [
          {
            date: "2024-12-14",
            points: 100,
            action: "first_purchase",
            description: "Bonus primera compra"
          },
          {
            date: "2024-12-14",
            points: 42,
            action: "purchase",
            description: "Compra #ORD-2024-1152 - Llavero personalizado"
          }
        ]
      },
      {
        id: "cust-7",
        customerName: "Sofía Morales",
        customerEmail: "sofia.morales@email.com",
        totalPoints: 956,
        availablePoints: 756,
        currentTier: "Plata",
        nextTier: "Oro",
        pointsToNextTier: 544,
        joinDate: "2023-05-30",
        lastActivity: "2024-12-13",
        lifetimeSpent: 567.90,
        rewardsRedeemed: 3,
        tierHistory: [
          { tier: "Bronce", achievedDate: "2023-05-30" },
          { tier: "Plata", achievedDate: "2023-10-12" }
        ],
        pointsHistory: [
          {
            date: "2024-12-13",
            points: 78,
            action: "purchase",
            description: "Compra #ORD-2024-1151 - Sudadera hoodie"
          },
          {
            date: "2024-12-10",
            points: -200,
            action: "redemption",
            description: "Canje: 10% descuento"
          }
        ]
      },
      {
        id: "cust-8",
        customerName: "Roberto Vega",
        customerEmail: "roberto.vega@email.com",
        totalPoints: 2134,
        availablePoints: 1934,
        currentTier: "Oro",
        nextTier: "Platino",
        pointsToNextTier: 2866,
        joinDate: "2023-01-22",
        lastActivity: "2024-12-12",
        lifetimeSpent: 1045.60,
        rewardsRedeemed: 6,
        tierHistory: [
          { tier: "Bronce", achievedDate: "2023-01-22" },
          { tier: "Plata", achievedDate: "2023-06-18" },
          { tier: "Oro", achievedDate: "2024-01-30" }
        ],
        pointsHistory: [
          {
            date: "2024-12-12",
            points: 156,
            action: "purchase",
            description: "Compra #ORD-2024-1150 - Botella térmica"
          },
          {
            date: "2024-12-08",
            points: -200,
            action: "redemption",
            description: "Canje: 10% descuento"
          }
        ]
      }
    ]

    // Sort by total points (highest first)
    customers.sort((a, b) => b.totalPoints - a.totalPoints)

    return NextResponse.json(customers)

  } catch (error) {
    console.error("Error fetching loyalty customers:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}