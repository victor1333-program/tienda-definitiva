import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db';
import nodemailer from 'nodemailer'
import { withRateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { validateBody, contactFormSchema } from '@/lib/validation'
import { apiSecurityHeaders } from '@/lib/security-headers'
import { logMaliciousRequest } from '@/lib/security-logger'

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

async function contactHandler(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos de entrada con sanitización
    const validation = validateBody(contactFormSchema)(body)
    if (!validation.success) {
      logMaliciousRequest(request, `Invalid contact form data: ${validation.errors[0]}`)
      return apiSecurityHeaders(NextResponse.json(
        { message: validation.errors[0] },
        { status: 400 }
      ))
    }
    
    const validatedData = validation.data

    // Save to database
    const contactSubmission = await db.contactSubmission.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        subject: validatedData.subject,
        message: validatedData.message,
        orderType: validatedData.orderType || null,
        status: 'PENDING',
        createdAt: new Date(),
      },
    })

    // Send email notification to admin
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Nueva Consulta - Lovilike</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937;">Detalles del contacto:</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Nombre:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${validatedData.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Email:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${validatedData.email}">${validatedData.email}</a></td>
            </tr>
            ${validatedData.phone ? `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Teléfono:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><a href="tel:${validatedData.phone}">${validatedData.phone}</a></td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Asunto:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${validatedData.subject}</td>
            </tr>
            ${validatedData.orderType ? `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Tipo de pedido:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${validatedData.orderType}</td>
            </tr>
            ` : ''}
          </table>
          <div style="margin-top: 20px;">
            <h3 style="color: #1f2937;">Mensaje:</h3>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              ${validatedData.message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px;">
            <p style="margin: 0; color: #92400e;">
              <strong>ID de consulta:</strong> ${contactSubmission.id}<br>
              <strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      </div>
    `

    // Send email to admin
    await transporter.sendMail({
      from: `"Lovilike Contact" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || 'info@lovilike.es',
      subject: `Nueva consulta: ${validatedData.subject}`,
      html: adminEmailHtml,
    })

    // Send confirmation email to customer
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">¡Gracias por contactarnos!</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb;">
          <p>Hola <strong>${validatedData.name}</strong>,</p>
          <p>Hemos recibido tu consulta y nos pondremos en contacto contigo en las próximas 24 horas.</p>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0369a1; margin-top: 0;">Resumen de tu consulta:</h3>
            <p><strong>Asunto:</strong> ${validatedData.subject}</p>
            ${validatedData.orderType ? `<p><strong>Tipo de pedido:</strong> ${validatedData.orderType}</p>` : ''}
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
            <p><strong>Número de referencia:</strong> #${contactSubmission.id}</p>
          </div>

          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">Información de contacto:</h3>
            <p>📞 <strong>Teléfono:</strong> <a href="tel:611066997">611 066 997</a></p>
            <p>📧 <strong>Email:</strong> <a href="mailto:info@lovilike.es">info@lovilike.es</a></p>
            <p>💬 <strong>WhatsApp:</strong> <a href="https://wa.me/34611066997">+34 611 066 997</a></p>
            <p>🕒 <strong>Horario:</strong> Lunes a Viernes de 9:00 a 20:00h</p>
          </div>

          <p>Si tu consulta es urgente, no dudes en llamarnos directamente.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <p>¡Gracias por confiar en Lovilike!</p>
            <p style="color: #6b7280; font-size: 14px;">El equipo de Lovilike</p>
          </div>
        </div>
      </div>
    `

    await transporter.sendMail({
      from: `"Lovilike" <${process.env.SMTP_USER}>`,
      to: validatedData.email,
      subject: 'Confirmación de recepción - Lovilike',
      html: customerEmailHtml,
    })

    return apiSecurityHeaders(NextResponse.json(
      { 
        message: 'Mensaje enviado correctamente. Te contactaremos pronto.',
        id: contactSubmission.id 
      },
      { status: 200 }
    ))

  } catch (error) {
    console.error('Error processing contact form:', error)
    logMaliciousRequest(request, `Contact form error: ${error instanceof Error ? error.message : 'unknown'}`)
    
    return apiSecurityHeaders(NextResponse.json(
      { message: 'Error al procesar la solicitud. Inténtalo de nuevo.' },
      { status: 500 }
    ))
  }
}

async function getContactsHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100) // Limitar máximo
    
    const where = status ? { status } : {}
    
    const submissions = await db.contactSubmission.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })
    
    return apiSecurityHeaders(NextResponse.json(submissions))
  } catch (error) {
    console.error('Error fetching contact submissions:', error)
    logMaliciousRequest(request, `Contact fetch error: ${error instanceof Error ? error.message : 'unknown'}`)
    
    return apiSecurityHeaders(NextResponse.json(
      { message: 'Error al obtener las consultas' },
      { status: 500 }
    ))
  }
}

// Aplicar rate limiting
export const POST = withRateLimit(rateLimitConfigs.contact, contactHandler)
export const GET = withRateLimit(rateLimitConfigs.api, getContactsHandler)