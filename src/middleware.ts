import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Si la ruta es /admin y el usuario no es admin, redirigir
    if (req.nextUrl.pathname.startsWith("/admin")) {
      const token = req.nextauth.token
      
      if (!token) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }

      if (token.role !== "ADMIN" && token.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Para rutas admin, requerir autenticación
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
  ]
}