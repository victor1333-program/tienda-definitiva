"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, User, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import NotificationCenter from "./notifications/NotificationCenter"

interface AdminHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="fixed top-0 left-56 right-0 z-40 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Panel de Administración
            </h1>
            <p className="text-xs text-gray-600 hidden sm:block">
              Gestiona todos los aspectos de Lovilike Personalizados
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <NotificationCenter />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full p-0 hover:bg-gray-100 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                <Avatar className="h-9 w-9 ring-2 ring-white shadow-md">
                  <AvatarImage src={user.image || ""} alt={user.name || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-sm font-semibold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-64 bg-white border border-gray-200 shadow-xl rounded-lg p-0" 
              align="end" 
              forceMount
              sideOffset={8}
            >
              {/* User Info Header */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                    <AvatarImage src={user.image || ""} alt={user.name || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-sm font-semibold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-600 truncate">{user.email}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Menu Items */}
              <div className="py-2">
                <DropdownMenuItem asChild>
                  <Link 
                    href="/admin/perfil" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    <User className="mr-3 h-4 w-4 text-gray-500" />
                    <span>Mi Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    href="/admin/configuracion" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    <Settings className="mr-3 h-4 w-4 text-gray-500" />
                    <span>Configuración</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="my-1 bg-gray-200" />
                
                <DropdownMenuItem 
                  onClick={() => signOut()}
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}