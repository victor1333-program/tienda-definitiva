import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db as prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const complexity = searchParams.get('complexity');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
      isPublic: true,
    };

    if (productId) {
      where.productId = productId;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (complexity) {
      where.designComplexity = complexity;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { marketingTags: { has: search } }
      ];
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category
          }
        }
      };
    }

    const [designVariants, total] = await Promise.all([
      prisma.productDesignVariant.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              basePrice: true,
              stock: true,
              variants: {
                where: { isActive: true },
                select: {
                  id: true,
                  sku: true,
                  size: true,
                  colorName: true,
                  colorHex: true,
                  stock: true,
                  price: true
                }
              }
            }
          },
          template: {
            select: {
              id: true,
              name: true,
              category: true,
              thumbnailUrl: true
            }
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          },
          _count: {
            select: {
              orderItems: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortBy === 'popularity' ? undefined : 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.productDesignVariant.count({ where })
    ]);

    // Si se ordena por popularidad, usar el conteo de órdenes
    if (sortBy === 'popularity') {
      designVariants.sort((a, b) => b._count.orderItems - a._count.orderItems);
    }

    return NextResponse.json({
      designVariants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching design variants:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      productId,
      templateId,
      name,
      description,
      shortDescription,
      images,
      thumbnailUrl,
      designSurcharge,
      comparePrice,
      designData,
      designComplexity,
      metaTitle,
      metaDescription,
      marketingTags,
      allowCustomization,
      customizationPrice,
      featured,
      categoryIds
    } = data;

    // Validar que el producto existe y es personalizable
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    if (!product.isPersonalizable) {
      return NextResponse.json(
        { error: 'El producto debe ser personalizable' },
        { status: 400 }
      );
    }

    // Generar slug único
    const baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    
    let slug = baseSlug;
    let counter = 1;
    
    while (await prisma.productDesignVariant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Generar SKU único
    const baseSku = `${product.sku || product.slug}-DSG`;
    let sku = baseSku;
    counter = 1;
    
    while (await prisma.productDesignVariant.findUnique({ where: { sku } })) {
      sku = `${baseSku}-${counter.toString().padStart(3, '0')}`;
      counter++;
    }

    // Crear la variante de diseño
    const designVariant = await prisma.productDesignVariant.create({
      data: {
        productId,
        templateId,
        name,
        slug,
        sku,
        description,
        shortDescription,
        images: JSON.stringify(images || []),
        thumbnailUrl,
        basePrice: product.basePrice,
        designSurcharge: designSurcharge || 0,
        comparePrice,
        designData,
        designComplexity: designComplexity || 'SIMPLE',
        metaTitle,
        metaDescription,
        marketingTags: marketingTags || [],
        allowCustomization: allowCustomization || false,
        customizationPrice,
        featured: featured || false,
        createdBy: session.user.id,
        publishedAt: new Date(),
        categories: categoryIds ? {
          create: categoryIds.map((categoryId: string, index: number) => ({
            categoryId,
            isPrimary: index === 0
          }))
        } : undefined
      },
      include: {
        product: true,
        template: true,
        categories: {
          include: {
            category: true
          }
        }
      }
    });

    // Marcar el producto como que tiene variantes de diseño
    await prisma.product.update({
      where: { id: productId },
      data: { hasDesignVariants: true }
    });

    return NextResponse.json(designVariant, { status: 201 });

  } catch (error) {
    console.error('Error creating design variant:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}