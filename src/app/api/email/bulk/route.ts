import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { sendBulkEmails } from "@/lib/email-advanced"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { emails } = await request.json()

    // Validate emails array
    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "Se requiere un array de emails no vacío" },
        { status: 400 }
      )
    }

    // Validate each email object
    for (const email of emails) {
      if (!email.to || !email.subject || !email.type || !email.data) {
        return NextResponse.json(
          { error: "Cada email debe tener: to, subject, type, data" },
          { status: 400 }
        )
      }
    }

    // Limit bulk emails to prevent abuse
    if (emails.length > 100) {
      return NextResponse.json(
        { error: "Máximo 100 emails por lote" },
        { status: 400 }
      )
    }

    // Send bulk emails
    const results = await sendBulkEmails(emails)

    return NextResponse.json({
      success: true,
      message: "Emails en lote procesados",
      results: {
        total: emails.length,
        successful: results.success,
        failed: results.failed
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Error in bulk email API:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}