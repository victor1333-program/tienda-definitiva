import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./src/lib/db"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // Deshabilitado para HTTP
      },
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔐 AUTHORIZE - Iniciando proceso de autorización...')
        console.log('📧 Email recibido:', credentials?.email)
        console.log('🔑 Password recibido:', credentials?.password ? '***' : 'undefined')

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ AUTHORIZE - Credenciales faltantes')
          return null
        }

        try {
          console.log('🔍 AUTHORIZE - Buscando usuario en base de datos...')
          const user = await db.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          console.log('👤 AUTHORIZE - Usuario encontrado:', !!user)

          if (!user || !user.password) {
            console.log('❌ AUTHORIZE - Usuario no encontrado o sin password')
            return null
          }

          console.log('✅ AUTHORIZE - Usuario:', user.email, '| Role:', user.role)
          console.log('📧 AUTHORIZE - Email verificado:', !!user.emailVerified)

          // Verificar si el usuario tiene email verificado (en lugar de isActive)
          // TEMPORALMENTE DESHABILITADO para admins - se puede habilitar después
          if (!user.emailVerified && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            console.log('❌ AUTHORIZE - Email no verificado')
            throw new Error('Email no verificado. Verifica tu email para activar la cuenta.')
          }

          console.log('🔐 AUTHORIZE - Verificando contraseña...')
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          console.log('✅ AUTHORIZE - Contraseña válida:', isPasswordValid)

          if (!isPasswordValid) {
            console.log('❌ AUTHORIZE - Contraseña incorrecta')
            return null
          }

          const returnUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }

          console.log('✅ AUTHORIZE - Autorización exitosa:', returnUser.email)
          return returnUser
        } catch (error) {
          console.error('❌ AUTHORIZE - Error durante autorización:', error)
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
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          role: token.role,
        }
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
})
