import { db as prisma } from '@/lib/db';

export interface PricingBreakdown {
  basePrice: number;
  personalizationPrice: number;
  quantityDiscount: number;
  finalPrice: number;
  breakdown: PriceBreakdownItem[];
}

export interface PriceBreakdownItem {
  description: string;
  amount: number;
  type: 'base' | 'personalization' | 'discount';
}

export interface PersonalizationRequest {
  productId: string;
  quantity: number;
  sides?: string[];
  areas?: string[];
}

export async function calculatePersonalizationPrice(
  request: PersonalizationRequest
): Promise<PricingBreakdown> {
  const { productId, quantity, sides = [], areas = [] } = request;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      basePrice: true,
      name: true,
    },
  });

  if (!product) {
    throw new Error('Producto no encontrado');
  }

  const pricingRules = await prisma.personalizationPricingRule.findMany({
    where: {
      productId,
      isActive: true,
    },
    include: {
      rules: {
        include: {
          side: true,
          printArea: true,
        },
      },
      quantityDiscounts: {
        orderBy: {
          minQuantity: 'desc',
        },
      },
    },
  });

  let personalizationPrice = 0;
  const breakdown: PriceBreakdownItem[] = [];

  breakdown.push({
    description: product.name,
    amount: product.basePrice,
    type: 'base',
  });

  for (const pricingRule of pricingRules) {
    let ruleApplied = false;

    for (const rule of pricingRule.rules) {
      if (rule.type === 'SIDE' && rule.sideId && sides.includes(rule.sideId)) {
        personalizationPrice += rule.price;
        breakdown.push({
          description: pricingRule.description,
          amount: rule.price,
          type: 'personalization',
        });
        ruleApplied = true;
      } else if (rule.type === 'AREA' && rule.printAreaId && areas.includes(rule.printAreaId)) {
        personalizationPrice += rule.price;
        breakdown.push({
          description: pricingRule.description,
          amount: rule.price,
          type: 'personalization',
        });
        ruleApplied = true;
      }
    }

    if (ruleApplied && quantity > 1) {
      const applicableDiscount = pricingRule.quantityDiscounts.find(
        discount => quantity >= discount.minQuantity
      );

      if (applicableDiscount) {
        let discountAmount = 0;
        
        if (applicableDiscount.discountType === 'PERCENTAGE') {
          discountAmount = (personalizationPrice * applicableDiscount.discountValue) / 100;
        } else {
          discountAmount = applicableDiscount.discountValue;
        }

        breakdown.push({
          description: `Descuento por cantidad (${quantity}+ unidades)`,
          amount: -discountAmount,
          type: 'discount',
        });

        personalizationPrice -= discountAmount;
      }
    }
  }

  const basePrice = product.basePrice;
  const quantityDiscount = breakdown
    .filter(item => item.type === 'discount')
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);

  const finalPrice = (basePrice + personalizationPrice) * quantity;

  return {
    basePrice,
    personalizationPrice,
    quantityDiscount,
    finalPrice,
    breakdown,
  };
}

export async function getProductPricingRules(productId: string) {
  const pricingRules = await prisma.personalizationPricingRule.findMany({
    where: {
      productId,
      isActive: true,
    },
    include: {
      rules: {
        include: {
          side: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
          printArea: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
        },
      },
      quantityDiscounts: {
        orderBy: {
          minQuantity: 'asc',
        },
      },
    },
  });

  return pricingRules;
}

export async function getQuantityDiscounts(productId: string) {
  const pricingRules = await prisma.personalizationPricingRule.findMany({
    where: {
      productId,
      isActive: true,
    },
    include: {
      quantityDiscounts: {
        orderBy: {
          minQuantity: 'asc',
        },
      },
    },
  });

  const allDiscounts = pricingRules.flatMap(rule => 
    rule.quantityDiscounts.map(discount => ({
      ...discount,
      ruleName: rule.name,
      ruleDescription: rule.description,
    }))
  );

  const uniqueDiscounts = allDiscounts.reduce((acc, discount) => {
    const existing = acc.find(d => d.minQuantity === discount.minQuantity);
    if (!existing || discount.discountValue > existing.discountValue) {
      const index = acc.findIndex(d => d.minQuantity === discount.minQuantity);
      if (index >= 0) {
        acc[index] = discount;
      } else {
        acc.push(discount);
      }
    }
    return acc;
  }, [] as any[]);

  return uniqueDiscounts.sort((a, b) => a.minQuantity - b.minQuantity);
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}