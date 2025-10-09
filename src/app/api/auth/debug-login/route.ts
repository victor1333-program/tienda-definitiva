import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('🧪 DEBUG LOGIN - Iniciando proceso de autenticación...')
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Password length: ${password?.length || 0}`)

    // Paso 1: Verificar parámetros
    if (!email || !password) {
      console.log('❌ Faltan credenciales')
      return NextResponse.json({ 
        success: false, 
        error: 'Email y contraseña requeridos',
        step: 'validation'
      }, { status: 400 })
    }

    // Paso 2: Buscar usuario en base de datos
    console.log('🔍 Buscando usuario en base de datos...')
    let user
    try {
      user = await db.user.findUnique({
        where: { email }
      })
      console.log(`👤 Usuario encontrado: ${!!user}`)
      
      if (user) {
        console.log(`📧 Email: ${user.email}`)
        console.log(`👤 Nombre: ${user.name}`)
        console.log(`🔐 Role: ${user.role}`)
        console.log(`✅ Email verificado: ${!!user.emailVerified}`)
        console.log(`🔒 Tiene password: ${!!user.password}`)
      }
    } catch (dbError) {
      console.error('❌ Error de base de datos:', dbError)
      return NextResponse.json({ 
        success: false, 
        error: 'Error de conexión a la base de datos',
        step: 'database',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 })
    }

    if (!user) {
      console.log('❌ Usuario no encontrado')
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no encontrado',
        step: 'user_lookup'
      }, { status: 404 })
    }

    if (!user.password) {
      console.log('❌ Usuario sin contraseña')
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario sin contraseña configurada',
        step: 'password_check'
      }, { status: 400 })
    }

    // Paso 3: Verificar email (solo para no-admins)
    if (!user.emailVerified && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('❌ Email no verificado')
      return NextResponse.json({ 
        success: false, 
        error: 'Email no verificado',
        step: 'email_verification'
      }, { status: 400 })
    }

    // Paso 4: Verificar contraseña
    console.log('🔐 Verificando contraseña...')
    let isPasswordValid
    try {
      isPasswordValid = await bcrypt.compare(password, user.password)
      console.log(`✅ Contraseña válida: ${isPasswordValid}`)
    } catch (bcryptError) {
      console.error('❌ Error en bcrypt:', bcryptError)
      return NextResponse.json({ 
        success: false, 
        error: 'Error verificando contraseña',
        step: 'password_verification',
        details: bcryptError instanceof Error ? bcryptError.message : 'Unknown bcrypt error'
      }, { status: 500 })
    }

    if (!isPasswordValid) {
      console.log('❌ Contraseña incorrecta')
      return NextResponse.json({ 
        success: false, 
        error: 'Contraseña incorrecta',
        step: 'password_validation'
      }, { status: 401 })
    }

    // Paso 5: Preparar objeto de usuario
    const returnUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }

    console.log('✅ Autenticación exitosa')
    console.log('📋 Usuario autenticado:', returnUser)

    return NextResponse.json({
      success: true,
      user: returnUser,
      message: 'Autenticación exitosa',
      step: 'complete'
    })

  } catch (error) {
    console.error('❌ Error general en debug-login:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      step: 'general_error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}