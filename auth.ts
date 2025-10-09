import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "./src/lib/db"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔐 NextAuth authorize() iniciado')
        console.log(`📧 Email: ${credentials?.email}`)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Credenciales faltantes')
          return null
        }

        try {
          console.log('🔍 Buscando usuario en DB...')
          const user = await db.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          console.log(`👤 Usuario encontrado: ${!!user}`)

          if (!user || !user.password) {
            console.log('❌ Usuario no encontrado o sin contraseña')
            return null
          }

          console.log(`🔐 Role del usuario: ${user.role}`)
          console.log(`✅ Email verificado: ${!!user.emailVerified}`)

          // Verificar si el usuario tiene email verificado (en lugar de isActive)
          // TEMPORALMENTE DESHABILITADO para admins - se puede habilitar después
          if (!user.emailVerified && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            console.log('❌ Email no verificado para usuario no-admin')
            throw new Error('Email no verificado. Verifica tu email para activar la cuenta.')
          }

          console.log('🔑 Verificando contraseña...')
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          console.log(`✅ Contraseña válida: ${isPasswordValid}`)

          if (!isPasswordValid) {
            console.log('❌ Contraseña incorrecta')
            return null
          }

          const returnUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
          
          console.log('✅ Autenticación exitosa, retornando usuario:', returnUser)
          return returnUser
        } catch (error) {
          console.error('❌ Error en authorize():', error)
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ Stack trace:', error.stack)
          }
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        const newSession = {
          ...session,
          user: {
            ...session.user,
            id: token.sub || token.id,
            role: token.role,
          }
        }
        console.log('🔄 Session callback - nueva sesión:', newSession.user)
        return newSession
      }
      console.log('⚠️ Session callback - sin token')
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
})