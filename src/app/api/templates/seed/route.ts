import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar si ya existen templates de ejemplo
    const existingTemplates = await db.personalizationTemplate.findMany({
      where: { isGlobal: true }
    })

    if (existingTemplates.length > 0) {
      return NextResponse.json({ 
        message: 'Los templates de ejemplo ya existen',
        templates: existingTemplates
      })
    }

    // Templates de ejemplo
    const sampleTemplates = [
      {
        name: 'Camiseta Básica',
        description: 'Template estándar para personalización de camisetas con área de texto frontal',
        isGlobal: true,
        templateData: JSON.stringify({
          areas: [
            {
              id: '1',
              name: 'Texto Frontal',
              type: 'text',
              x: 25,
              y: 30,
              width: 50,
              height: 15,
              allowResize: true,
              allowMove: true,
              placeholderText: 'Tu texto aquí',
              fontOptions: ['Arial', 'Helvetica', 'Times New Roman'],
              colorOptions: ['#000000', '#FFFFFF', '#FF0000', '#0000FF'],
              price: 5,
              isRequired: false,
              order: 0
            }
          ],
          settings: {
            enablePersonalization: true,
            maxPersonalizationAreas: 3,
            defaultFont: 'Arial',
            defaultFontSize: 16,
            defaultTextColor: '#000000',
            allowCustomColors: true,
            allowCustomFonts: true,
            allowImageUpload: false
          },
          version: '1.0'
        }),
        previewImage: '',
        isActive: true
      },
      {
        name: 'Taza Personalizada',
        description: 'Template para tazas con área de texto y logo',
        isGlobal: true,
        templateData: JSON.stringify({
          areas: [
            {
              id: '1',
              name: 'Texto Principal',
              type: 'text',
              x: 20,
              y: 40,
              width: 60,
              height: 20,
              allowResize: true,
              allowMove: true,
              placeholderText: 'Nombre o mensaje',
              fontOptions: ['Arial', 'Comic Sans MS', 'Times New Roman'],
              colorOptions: ['#000000', '#FF0000', '#0000FF', '#FFA500'],
              price: 3,
              isRequired: true,
              order: 0
            },
            {
              id: '2',
              name: 'Logo/Imagen',
              type: 'image',
              x: 30,
              y: 10,
              width: 40,
              height: 25,
              allowResize: true,
              allowMove: true,
              price: 7,
              isRequired: false,
              order: 1
            }
          ],
          settings: {
            enablePersonalization: true,
            maxPersonalizationAreas: 2,
            defaultFont: 'Arial',
            defaultFontSize: 14,
            defaultTextColor: '#000000',
            allowCustomColors: true,
            allowCustomFonts: false,
            allowImageUpload: true,
            maxImageSize: 2
          },
          version: '1.0'
        }),
        previewImage: '',
        isActive: true
      },
      {
        name: 'Poster Evento',
        description: 'Template completo para posters con múltiples áreas de personalización',
        isGlobal: true,
        templateData: JSON.stringify({
          areas: [
            {
              id: '1',
              name: 'Título Principal',
              type: 'text',
              x: 10,
              y: 15,
              width: 80,
              height: 15,
              allowResize: true,
              allowMove: true,
              placeholderText: 'TÍTULO DEL EVENTO',
              fontOptions: ['Arial Black', 'Impact', 'Helvetica'],
              colorOptions: ['#000000', '#FFFFFF', '#FF0000', '#0000FF'],
              price: 8,
              isRequired: true,
              order: 0
            },
            {
              id: '2',
              name: 'Subtítulo',
              type: 'text',
              x: 15,
              y: 35,
              width: 70,
              height: 10,
              allowResize: true,
              allowMove: true,
              placeholderText: 'Descripción del evento',
              fontOptions: ['Arial', 'Georgia', 'Verdana'],
              colorOptions: ['#000000', '#666666', '#333333'],
              price: 4,
              isRequired: false,
              order: 1
            },
            {
              id: '3',
              name: 'Logo Central',
              type: 'image',
              x: 35,
              y: 50,
              width: 30,
              height: 30,
              allowResize: true,
              allowMove: true,
              price: 10,
              isRequired: false,
              order: 2
            },
            {
              id: '4',
              name: 'Información Adicional',
              type: 'text',
              x: 20,
              y: 85,
              width: 60,
              height: 8,
              allowResize: true,
              allowMove: true,
              placeholderText: 'Fecha, hora y lugar',
              fontOptions: ['Arial', 'Courier New'],
              colorOptions: ['#000000', '#333333'],
              price: 3,
              isRequired: false,
              order: 3
            }
          ],
          settings: {
            enablePersonalization: true,
            maxPersonalizationAreas: 5,
            defaultFont: 'Arial',
            defaultFontSize: 16,
            defaultTextColor: '#000000',
            allowCustomColors: true,
            allowCustomFonts: true,
            allowImageUpload: true,
            maxImageSize: 5
          },
          version: '1.0'
        }),
        previewImage: '',
        isActive: true
      }
    ]

    const createdTemplates = []
    for (const template of sampleTemplates) {
      const created = await db.personalizationTemplate.create({
        data: template
      })
      createdTemplates.push(created)
    }

    return NextResponse.json({
      message: 'Templates de ejemplo creados exitosamente',
      templates: createdTemplates
    })

  } catch (error) {
    console.error('Error creating sample templates:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}