import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const printingMethod = await db.printingMethodConfig.findUnique({
      where: { id }
    });

    if (!printingMethod) {
      return NextResponse.json(
        { error: 'Método de impresión no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(printingMethod);
  } catch (error) {
    console.error('Error fetching printing method:', error);
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
    const data = await request.json();
    
    const printingMethod = await db.printingMethodConfig.update({
      where: { id },
      data: {
        name: data.name,
        isActive: data.isActive,
        
        // Archivos listos para imprimir
        outputFormat: data.outputFormat,
        dpi: data.dpi,
        singleFile: data.singleFile,
        useCMYKProfile: data.useCMYKProfile,
        duplicateFiles: data.duplicateFiles,
        replaceColors: data.replaceColors,
        
        // Configuración general
        maxColors: data.maxColors,
        
        // Configuración de texto
        allowText: data.allowText,
        allowTextArt: data.allowTextArt,
        allowTextBox: data.allowTextBox,
        allowCurvedText: data.allowCurvedText,
        allowBold: data.allowBold,
        allowItalic: data.allowItalic,
        allowUppercase: data.allowUppercase,
        maxTextElements: data.maxTextElements,
        defaultTextColor: data.defaultTextColor,
        predefinedColors: JSON.stringify(data.predefinedColors || []),
        textResizeMode: data.textResizeMode,
        defaultFontSize: data.defaultFontSize,
        enableTextStroke: data.enableTextStroke,
        allowTextOutline: data.allowTextOutline,
        
        // Interlineado
        minLineSpacing: data.minLineSpacing,
        maxLineSpacing: data.maxLineSpacing,
        
        // Espaciado de letras
        minLetterSpacing: data.minLetterSpacing,
        maxLetterSpacing: data.maxLetterSpacing,
        
        // Alineación
        allowLeftAlign: data.allowLeftAlign,
        allowCenterAlign: data.allowCenterAlign,
        allowRightAlign: data.allowRightAlign,
        allowJustifyAlign: data.allowJustifyAlign,
        allowTopAlign: data.allowTopAlign,
        allowMiddleAlign: data.allowMiddleAlign,
        allowBottomAlign: data.allowBottomAlign,
        
        // Configuración de imágenes
        enableImageGallery: data.enableImageGallery,
        autoFitImages: data.autoFitImages,
        preventImageResize: data.preventImageResize,
        allowUserUploads: data.allowUserUploads,
        allowLargeFiles: data.allowLargeFiles,
        maxImages: data.maxImages,
        allowImageStretch: data.allowImageStretch,
        allowSVGColorChange: data.allowSVGColorChange,
        
        // Formatos aceptados
        acceptPNG: data.acceptPNG,
        acceptJPG: data.acceptJPG,
        acceptSVG: data.acceptSVG,
        acceptPDF: data.acceptPDF,
        acceptEPS: data.acceptEPS,
        acceptAI: data.acceptAI,
        allowPDFRaster: data.allowPDFRaster,
        convertPDFToRaster: data.convertPDFToRaster,
        resizeLargePDF: data.resizeLargePDF,
        convertEPSToRaster: data.convertEPSToRaster,
        convertAIToRaster: data.convertAIToRaster,
        allowFacebookPhotos: data.allowFacebookPhotos,
        allowPremiumPhotos: data.allowPremiumPhotos,
        
        // Herramientas de edición
        enableImageTools: data.enableImageTools,
        enableTransform: data.enableTransform,
        enableFilters: data.enableFilters,
        enableAdjustments: data.enableAdjustments,
        enableFocus: data.enableFocus,
        enableBrush: data.enableBrush,
        enableFrames: data.enableFrames,
        enableOverlay: data.enableOverlay,
        
        // PDF Preview
        allowPDFPreview: data.allowPDFPreview,
        
        // Herramientas generales
        allowDuplicate: data.allowDuplicate,
        allowFlip: data.allowFlip,
        allowLayerOrder: data.allowLayerOrder,
        
        // Sombras
        enableTextShadow: data.enableTextShadow,
        includeShadowInPrint: data.includeShadowInPrint,
        defaultShadowColor: data.defaultShadowColor,
        defaultShadowBlur: data.defaultShadowBlur,
        minShadowBlur: data.minShadowBlur,
        maxShadowBlur: data.maxShadowBlur,
        defaultShadowDistance: data.defaultShadowDistance,
        minShadowDistance: data.minShadowDistance,
        maxShadowDistance: data.maxShadowDistance,
        defaultShadowAngle: data.defaultShadowAngle,
        minShadowAngle: data.minShadowAngle,
        maxShadowAngle: data.maxShadowAngle,
        
        // Fuentes
        availableFonts: JSON.stringify(data.availableFonts || []),
        defaultFont: data.defaultFont,
        
        // Efectos
        enableEngraving: data.enableEngraving,
        enableFullColorWood: data.enableFullColorWood,
        
        // Productos asociados
        applicableProducts: JSON.stringify(data.applicableProducts || []),
        productSides: JSON.stringify(data.productSides || {})
      }
    });

    return NextResponse.json(printingMethod);
  } catch (error) {
    console.error('Error updating printing method:', error);
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
    await db.printingMethodConfig.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Método de impresión eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting printing method:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}