"use client"

import { useState } from "react"
import Link from "next/link"

export default function PersonalizacionProductosSimple() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Productos Personalizables</h1>
          <p className="text-gray-600 mt-1">Productos que tienen configurada personalización</p>
        </div>
        <Link 
          href="/admin/products"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Seleccionar Producto
        </Link>
      </div>

      <div className="p-4 border rounded-lg">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div className="text-center py-12">
        <p className="text-gray-600">Cargando productos...</p>
      </div>
    </div>
  )
}