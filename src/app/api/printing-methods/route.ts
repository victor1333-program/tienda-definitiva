import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
export async function GET() {
  try {
    const printingMethods = await db.printingMethodConfig.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(printingMethods);
  } catch (error) {
    console.error('Error fetching printing methods:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const printingMethod = await db.printingMethodConfig.create({
      data: {
        name: data.name,
        isActive: data.isActive ?? true,
        
        // Archivos listos para imprimir
        outputFormat: data.outputFormat || 'PDF',
        dpi: data.dpi || 300,
        singleFile: data.singleFile ?? true,
        useCMYKProfile: data.useCMYKProfile ?? false,
        duplicateFiles: data.duplicateFiles ?? false,
        replaceColors: data.replaceColors ?? false,
        
        // Configuración general
        maxColors: data.maxColors,
        
        // Configuración de texto
        allowText: data.allowText ?? true,
        allowTextArt: data.allowTextArt ?? true,
        allowTextBox: data.allowTextBox ?? true,
        allowCurvedText: data.allowCurvedText ?? true,
        allowBold: data.allowBold ?? true,
        allowItalic: data.allowItalic ?? true,
        allowUppercase: data.allowUppercase ?? true,
        maxTextElements: data.maxTextElements || 0,
        defaultTextColor: data.defaultTextColor || '#287fb9',
        predefinedColors: JSON.stringify(data.predefinedColors || []),
        textResizeMode: data.textResizeMode || 'UNRESTRICTED',
        defaultFontSize: data.defaultFontSize,
        enableTextStroke: data.enableTextStroke ?? false,
        allowTextOutline: data.allowTextOutline ?? false,
        
        // Interlineado
        minLineSpacing: data.minLineSpacing,
        maxLineSpacing: data.maxLineSpacing,
        
        // Espaciado de letras
        minLetterSpacing: data.minLetterSpacing,
        maxLetterSpacing: data.maxLetterSpacing,
        
        // Alineación
        allowLeftAlign: data.allowLeftAlign ?? true,
        allowCenterAlign: data.allowCenterAlign ?? true,
        allowRightAlign: data.allowRightAlign ?? true,
        allowJustifyAlign: data.allowJustifyAlign ?? true,
        allowTopAlign: data.allowTopAlign ?? true,
        allowMiddleAlign: data.allowMiddleAlign ?? true,
        allowBottomAlign: data.allowBottomAlign ?? true,
        
        // Configuración de imágenes
        enableImageGallery: data.enableImageGallery ?? true,
        autoFitImages: data.autoFitImages ?? true,
        preventImageResize: data.preventImageResize ?? false,
        allowUserUploads: data.allowUserUploads ?? true,
        allowLargeFiles: data.allowLargeFiles ?? false,
        maxImages: data.maxImages || 0,
        allowImageStretch: data.allowImageStretch ?? false,
        allowSVGColorChange: data.allowSVGColorChange ?? false,
        
        // Formatos aceptados
        acceptPNG: data.acceptPNG ?? true,
        acceptJPG: data.acceptJPG ?? true,
        acceptSVG: data.acceptSVG ?? true,
        acceptPDF: data.acceptPDF ?? true,
        acceptEPS: data.acceptEPS ?? false,
        acceptAI: data.acceptAI ?? false,
        allowPDFRaster: data.allowPDFRaster ?? false,
        convertPDFToRaster: data.convertPDFToRaster ?? false,
        resizeLargePDF: data.resizeLargePDF ?? true,
        convertEPSToRaster: data.convertEPSToRaster ?? false,
        convertAIToRaster: data.convertAIToRaster ?? false,
        allowFacebookPhotos: data.allowFacebookPhotos ?? false,
        allowPremiumPhotos: data.allowPremiumPhotos ?? false,
        
        // Herramientas de edición
        enableImageTools: data.enableImageTools ?? true,
        enableTransform: data.enableTransform ?? true,
        enableFilters: data.enableFilters ?? true,
        enableAdjustments: data.enableAdjustments ?? true,
        enableFocus: data.enableFocus ?? true,
        enableBrush: data.enableBrush ?? true,
        enableFrames: data.enableFrames ?? true,
        enableOverlay: data.enableOverlay ?? true,
        
        // PDF Preview
        allowPDFPreview: data.allowPDFPreview ?? true,
        
        // Herramientas generales
        allowDuplicate: data.allowDuplicate ?? true,
        allowFlip: data.allowFlip ?? true,
        allowLayerOrder: data.allowLayerOrder ?? true,
        
        // Sombras
        enableTextShadow: data.enableTextShadow ?? false,
        includeShadowInPrint: data.includeShadowInPrint ?? false,
        defaultShadowColor: data.defaultShadowColor || '#000000',
        defaultShadowBlur: data.defaultShadowBlur || 2,
        minShadowBlur: data.minShadowBlur || 0,
        maxShadowBlur: data.maxShadowBlur || 50,
        defaultShadowDistance: data.defaultShadowDistance || 2,
        minShadowDistance: data.minShadowDistance || 0,
        maxShadowDistance: data.maxShadowDistance || 200,
        defaultShadowAngle: data.defaultShadowAngle || 45,
        minShadowAngle: data.minShadowAngle || 0,
        maxShadowAngle: data.maxShadowAngle || 359,
        
        // Fuentes
        availableFonts: JSON.stringify(data.availableFonts || []),
        defaultFont: data.defaultFont,
        
        // Efectos
        enableEngraving: data.enableEngraving ?? false,
        enableFullColorWood: data.enableFullColorWood ?? false,
        
        // Productos asociados
        applicableProducts: JSON.stringify(data.applicableProducts || []),
        productSides: JSON.stringify(data.productSides || {})
      }
    });

    return NextResponse.json(printingMethod, { status: 201 });
  } catch (error) {
    console.error('Error creating printing method:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}