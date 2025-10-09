import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db as prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const designVariant = await prisma.productDesignVariant.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            variants: {
              where: { isActive: true },
              orderBy: [
                { size: 'asc' },
                { colorName: 'asc' }
              ]
            },
            categories: {
              include: {
                category: true
              }
            }
          }
        },
        template: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        _count: {
          select: {
            orderItems: true
          }
        }
      }
    });

    if (!designVariant) {
      return NextResponse.json(
        { error: 'Variante de diseño no encontrada' },
        { status: 404 }
      );
    }

    // Si no es público, solo los admins pueden verlo
    if (!designVariant.isPublic) {
      const session = await auth();
      if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(designVariant);

  } catch (error) {
    console.error('Error fetching design variant:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
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
      isActive,
      isPublic,
      categoryIds
    } = data;

    // Verificar que la variante existe
    const existingVariant = await prisma.productDesignVariant.findUnique({
      where: { id }
    });

    if (!existingVariant) {
      return NextResponse.json(
        { error: 'Variante de diseño no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar slug si cambió el nombre
    let slug = existingVariant.slug;
    if (name && name !== existingVariant.name) {
      const baseSlug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      
      let newSlug = baseSlug;
      let counter = 1;
      
      while (await prisma.productDesignVariant.findFirst({ 
        where: { 
          slug: newSlug,
          id: { not: id }
        } 
      })) {
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      slug = newSlug;
    }

    // Actualizar la variante
    const designVariant = await prisma.$transaction(async (tx) => {
      // Primero eliminar categorías existentes si se proporcionaron nuevas
      if (categoryIds) {
        await tx.productDesignCategory.deleteMany({
          where: { designVariantId: id }
        });
      }

      // Actualizar la variante
      return await tx.productDesignVariant.update({
        where: { id: id },
        data: {
          name: name || existingVariant.name,
          slug,
          description,
          shortDescription,
          images: images ? JSON.stringify(images) : undefined,
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
          isActive,
          isPublic,
          updatedAt: new Date(),
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
    });

    return NextResponse.json(designVariant);

  } catch (error) {
    console.error('Error updating design variant:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar que la variante existe
    const existingVariant = await prisma.productDesignVariant.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            orderItems: true
          }
        }
      }
    });

    if (!existingVariant) {
      return NextResponse.json(
        { error: 'Variante de diseño no encontrada' },
        { status: 404 }
      );
    }

    // No permitir eliminar si tiene órdenes asociadas
    if (existingVariant._count.orderItems > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una variante con órdenes asociadas' },
        { status: 400 }
      );
    }

    // Eliminar la variante
    await prisma.productDesignVariant.delete({
      where: { id: id }
    });

    // Verificar si el producto sigue teniendo variantes de diseño
    const remainingVariants = await prisma.productDesignVariant.count({
      where: { productId: existingVariant.productId }
    });

    if (remainingVariants === 0) {
      await prisma.product.update({
        where: { id: existingVariant.productId },
        data: { hasDesignVariants: false }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting design variant:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}