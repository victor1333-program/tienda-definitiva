"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, X, Users, Mail, Phone } from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  totalOrders?: number
  totalSpent?: number
}

interface CustomerSelectorProps {
  selectedCustomers: string[]
  onSelectionChange: (customerIds: string[]) => void
  placeholder?: string
}

export default function CustomerSelector({ 
  selectedCustomers, 
  onSelectionChange, 
  placeholder = "Buscar clientes..." 
}: CustomerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchCustomers(searchQuery)
    } else {
      setFilteredCustomers([])
      setShowDropdown(false)
    }
  }, [searchQuery])

  const searchCustomers = async (query: string) => {
    setLoading(true)
    try {
      // Mock data for demonstration - replace with actual API call
      const mockCustomers: Customer[] = [
        { 
          id: '1', 
          name: 'María García', 
          email: 'maria.garcia@email.com', 
          phone: '+34 600 123 456', 
          totalOrders: 12, 
          totalSpent: 245.80 
        },
        { 
          id: '2', 
          name: 'Juan Pérez', 
          email: 'juan.perez@email.com', 
          phone: '+34 600 234 567', 
          totalOrders: 8, 
          totalSpent: 189.95 
        },
        { 
          id: '3', 
          name: 'Ana López', 
          email: 'ana.lopez@email.com', 
          phone: '+34 600 345 678', 
          totalOrders: 15, 
          totalSpent: 367.20 
        },
        { 
          id: '4', 
          name: 'Carlos Ruiz', 
          email: 'carlos.ruiz@email.com', 
          phone: '+34 600 456 789', 
          totalOrders: 5, 
          totalSpent: 125.50 
        },
        { 
          id: '5', 
          name: 'Laura Martín', 
          email: 'laura.martin@email.com', 
          phone: '+34 600 567 890', 
          totalOrders: 20, 
          totalSpent: 456.75 
        },
        { 
          id: '6', 
          name: 'David Sánchez', 
          email: 'david.sanchez@email.com', 
          totalOrders: 3, 
          totalSpent: 89.99 
        },
        { 
          id: '7', 
          name: 'Elena Rodríguez', 
          email: 'elena.rodriguez@email.com', 
          phone: '+34 600 678 901', 
          totalOrders: 18, 
          totalSpent: 423.40 
        },
        { 
          id: '8', 
          name: 'Miguel Torres', 
          email: 'miguel.torres@email.com', 
          totalOrders: 7, 
          totalSpent: 156.30 
        }
      ]

      const filtered = mockCustomers.filter(customer =>
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.email.toLowerCase().includes(query.toLowerCase()) ||
        customer.phone?.includes(query)
      )

      setFilteredCustomers(filtered)
      setShowDropdown(true)
    } catch (error) {
      console.error('Error searching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomerSelect = (customer: Customer) => {
    if (!selectedCustomers.includes(customer.id)) {
      onSelectionChange([...selectedCustomers, customer.id])
    }
    setSearchQuery('')
    setShowDropdown(false)
  }

  const handleCustomerRemove = (customerId: string) => {
    onSelectionChange(selectedCustomers.filter(id => id !== customerId))
  }

  const getSelectedCustomersInfo = () => {
    // Mock customer info - replace with actual data
    const mockCustomers: Record<string, Customer> = {
      '1': { id: '1', name: 'María García', email: 'maria.garcia@email.com', totalOrders: 12 },
      '2': { id: '2', name: 'Juan Pérez', email: 'juan.perez@email.com', totalOrders: 8 },
      '3': { id: '3', name: 'Ana López', email: 'ana.lopez@email.com', totalOrders: 15 },
      '4': { id: '4', name: 'Carlos Ruiz', email: 'carlos.ruiz@email.com', totalOrders: 5 },
      '5': { id: '5', name: 'Laura Martín', email: 'laura.martin@email.com', totalOrders: 20 },
      '6': { id: '6', name: 'David Sánchez', email: 'david.sanchez@email.com', totalOrders: 3 },
      '7': { id: '7', name: 'Elena Rodríguez', email: 'elena.rodriguez@email.com', totalOrders: 18 },
      '8': { id: '8', name: 'Miguel Torres', email: 'miguel.torres@email.com', totalOrders: 7 }
    }

    return selectedCustomers.map(id => mockCustomers[id]).filter(Boolean)
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-10"
          />
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mx-auto"></div>
                <span className="ml-2">Buscando...</span>
              </div>
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => handleCustomerSelect(customer)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50"
                  disabled={selectedCustomers.includes(customer.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {customer.email}
                          </span>
                          {customer.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {customer.phone}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {customer.totalOrders} pedidos • €{customer.totalSpent?.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    {selectedCustomers.includes(customer.id) && (
                      <Badge variant="secondary" className="text-xs">Seleccionado</Badge>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-gray-500">
                No se encontraron clientes
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Customers */}
      {selectedCustomers.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Clientes seleccionados ({selectedCustomers.length}):
          </div>
          <div className="flex flex-wrap gap-2">
            {getSelectedCustomersInfo().map((customer) => (
              <Badge
                key={customer.id}
                variant="outline"
                className="flex items-center gap-1 px-2 py-1"
              >
                {customer.name}
                <button
                  onClick={() => handleCustomerRemove(customer.id)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}