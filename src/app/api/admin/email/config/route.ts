import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'
import { emailService } from '@/lib/email-service'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'ADMIN' && role !== 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener configuración actual
    const settings = await db.setting.findMany({
      where: {
        key: {
          in: ['smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_password', 'from_email', 'from_name']
        }
      }
    })

    const config = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)

    // No devolver la contraseña por seguridad
    if (config.smtp_password) {
      config.smtp_password = '***masked***'
    }

    return NextResponse.json({ config })

  } catch (error) {
    console.error('Error getting email config:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'ADMIN' && role !== 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const {
      smtp_host,
      smtp_port,
      smtp_secure,
      smtp_user,
      smtp_password,
      from_email,
      from_name
    } = await req.json()

    // Validaciones básicas
    if (!smtp_host || !smtp_port || !smtp_user || !from_email) {
      return NextResponse.json({ 
        error: 'Campos requeridos: host SMTP, puerto, usuario y email de origen' 
      }, { status: 400 })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(from_email) || !emailRegex.test(smtp_user)) {
      return NextResponse.json({ 
        error: 'Formato de email inválido' 
      }, { status: 400 })
    }

    // Validar puerto
    const port = parseInt(smtp_port)
    if (isNaN(port) || port < 1 || port > 65535) {
      return NextResponse.json({ 
        error: 'Puerto SMTP inválido' 
      }, { status: 400 })
    }

    const settings = [
      { key: 'smtp_host', value: smtp_host },
      { key: 'smtp_port', value: smtp_port.toString() },
      { key: 'smtp_secure', value: smtp_secure ? 'true' : 'false' },
      { key: 'smtp_user', value: smtp_user },
      { key: 'from_email', value: from_email },
      { key: 'from_name', value: from_name || 'Lovilike Personalizados' }
    ]

    // Solo actualizar contraseña si se proporciona y no es la máscara
    if (smtp_password && smtp_password !== '***masked***') {
      settings.push({ key: 'smtp_password', value: smtp_password })
    }

    // Guardar configuración en la base de datos
    for (const setting of settings) {
      await db.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: {
          key: setting.key,
          value: setting.value,
          description: getSettingDescription(setting.key)
        }
      })
    }

    // Reset del servicio de email para recargar configuración
    emailService.resetTransporter()

    // Probar la nueva configuración
    const testResult = await emailService.testConnection()

    return NextResponse.json({
      success: true,
      message: 'Configuración guardada exitosamente',
      connectionTest: testResult
    })

  } catch (error) {
    console.error('Error saving email config:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

function getSettingDescription(key: string): string {
  const descriptions: Record<string, string> = {
    smtp_host: 'Servidor SMTP para envío de emails',
    smtp_port: 'Puerto del servidor SMTP',
    smtp_secure: 'Usar conexión segura SSL/TLS',
    smtp_user: 'Usuario para autenticación SMTP',
    smtp_password: 'Contraseña para autenticación SMTP',
    from_email: 'Dirección de email de origen',
    from_name: 'Nombre que aparece como remitente'
  }
  return descriptions[key] || ''
}