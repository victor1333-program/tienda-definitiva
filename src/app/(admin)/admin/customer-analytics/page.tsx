"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"

export default function CustomerAnalyticsPage() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="space-y-8">
      <h1>Customer Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Content here</p>
        </CardContent>
      </Card>
    </div>
  )
}