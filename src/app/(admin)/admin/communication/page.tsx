"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { 
  MessageCircle,
  Send,
  Search,
  Filter,
  Phone,
  Video,
  MoreVertical,
  Users,
  Clock,
  CheckCheck,
  AlertTriangle,
  Star,
  Archive,
  Trash2,
  Plus,
  Paperclip,
  Smile,
  User,
  UserCheck,
  RefreshCw,
  Volume2,
  Bell,
  Settings
} from "lucide-react"

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  isRead: boolean
  type: 'text' | 'image' | 'file' | 'system'
  attachments?: {
    id: string
    name: string
    type: string
    size: number
    url: string
  }[]
}

interface Conversation {
  id: string
  participants: {
    id: string
    name: string
    avatar?: string
    role: string
    isOnline: boolean
    lastSeen?: string
  }[]
  lastMessage: Message
  unreadCount: number
  isPinned: boolean
  isArchived: boolean
  tags: string[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  type: 'direct' | 'group' | 'support'
  title?: string
}

interface Team {
  id: string
  name: string
  members: {
    id: string
    name: string
    avatar?: string
    role: string
    isOnline: boolean
    status: 'available' | 'busy' | 'away' | 'offline'
  }[]
  department: string
}

export default function CommunicationPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [teams, setTeams] = useState<Team[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUserId = "admin-1" // En producción vendría de la sesión

  useEffect(() => {
    loadConversations()
    loadTeams()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/communication/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/communication/messages?conversationId=${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
        // Marcar mensajes como leídos
        markAsRead(conversationId)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const loadTeams = async () => {
    try {
      const response = await fetch('/api/communication/teams')
      if (response.ok) {
        const data = await response.json()
        setTeams(data)
      }
    } catch (error) {
      console.error('Error loading teams:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: currentUserId,
      senderName: "Administrador",
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'text'
    }

    setMessages(prev => [...prev, tempMessage])
    setNewMessage('')

    try {
      const response = await fetch('/api/communication/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation,
          content: newMessage,
          type: 'text'
        })
      })

      if (response.ok) {
        const sentMessage = await response.json()
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? sentMessage : msg
        ))
        loadConversations() // Actualizar lista de conversaciones
      }
    } catch (error) {
      toast.error('Error al enviar mensaje')
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
    }
  }

  const markAsRead = async (conversationId: string) => {
    try {
      await fetch('/api/communication/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId })
      })
      
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const startNewConversation = async () => {
    try {
      const response = await fetch('/api/communication/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'direct',
          participantIds: [] // En producción se seleccionarían usuarios
        })
      })

      if (response.ok) {
        const newConv = await response.json()
        setConversations(prev => [newConv, ...prev])
        setSelectedConversation(newConv.id)
        toast.success('Nueva conversación creada')
      }
    } catch (error) {
      toast.error('Error al crear conversación')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participants.some(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || conv.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'unread' && conv.unreadCount > 0) ||
      (filterType === 'pinned' && conv.isPinned) ||
      (filterType === 'archived' && conv.isArchived) ||
      (filterType === conv.type)
    
    return matchesSearch && matchesFilter
  })

  const selectedConv = conversations.find(c => c.id === selectedConversation)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500'
      case 'busy': return 'bg-red-500'
      case 'away': return 'bg-yellow-500'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Centro de Comunicaciones</h1>
          <p className="text-gray-600 mt-2">Chat interno y gestión de mensajes del equipo</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={startNewConversation}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Conversación
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[800px]">
        {/* Sidebar - Conversations */}
        <div className="lg:col-span-1 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <CardTitle className="text-lg">Conversaciones</CardTitle>
              </div>
              
              <div className="space-y-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar conversaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="unread">No leídas</SelectItem>
                    <SelectItem value="pinned">Fijadas</SelectItem>
                    <SelectItem value="direct">Directos</SelectItem>
                    <SelectItem value="group">Grupos</SelectItem>
                    <SelectItem value="support">Soporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-0">
              <div className="space-y-1">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-3 cursor-pointer border-b transition-colors ${
                      selectedConversation === conversation.id
                        ? 'bg-orange-50 border-orange-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.participants[0]?.avatar} />
                          <AvatarFallback>
                            {conversation.participants[0]?.name.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.participants[0]?.isOnline && (
                          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {conversation.title || conversation.participants[0]?.name || 'Sin nombre'}
                          </p>
                          <div className="flex items-center gap-1">
                            {conversation.isPinned && (
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            )}
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 truncate mt-1">
                          {conversation.lastMessage.content}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            {new Date(conversation.lastMessage.timestamp).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <Badge className={getPriorityColor(conversation.priority)} variant="outline">
                            {conversation.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-2 flex flex-col">
          {selectedConv ? (
            <Card className="flex-1 flex flex-col">
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConv.participants[0]?.avatar} />
                      <AvatarFallback>
                        {selectedConv.participants[0]?.name.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {selectedConv.title || selectedConv.participants[0]?.name || 'Sin nombre'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedConv.participants[0]?.isOnline ? (
                          <span className="text-green-600">En línea</span>
                        ) : (
                          `Últ. vez ${selectedConv.participants[0]?.lastSeen || 'hace tiempo'}`
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className={`max-w-[70%] ${
                      message.senderId === currentUserId ? 'order-2' : 'order-1'
                    }`}>
                      <div className={`rounded-lg px-4 py-2 ${
                        message.senderId === currentUserId
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {message.senderId !== currentUserId && (
                          <p className="text-xs font-medium mb-1">{message.senderName}</p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center gap-2 text-xs">
                                <Paperclip className="h-3 w-3" />
                                <span>{attachment.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                        message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                      }`}>
                        <span>
                          {new Date(message.timestamp).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {message.senderId === currentUserId && (
                          <CheckCheck className={`h-3 w-3 ${
                            message.isRead ? 'text-blue-500' : 'text-gray-400'
                          }`} />
                        )}
                      </div>
                    </div>
                    
                    <Avatar className={`h-8 w-8 ${
                      message.senderId === currentUserId ? 'order-1 mr-2' : 'order-2 ml-2'
                    }`}>
                      <AvatarImage src={message.senderAvatar} />
                      <AvatarFallback className="text-xs">
                        {message.senderName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-xs">Escribiendo...</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </CardContent>
              
              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Escribe un mensaje..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Selecciona una conversación</h3>
                  <p className="text-gray-600">Elige una conversación de la lista para comenzar a chatear</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Sidebar - Team & Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Equipo en Línea
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {teams.flatMap(team => team.members).filter(member => member.isOnline).map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-xs">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 h-3 w-3 border-2 border-white rounded-full ${
                      getStatusColor(member.status)
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                    <p className="text-xs text-gray-600">{member.role}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MessageCircle className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Estadísticas de Hoy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mensajes enviados</span>
                <span className="font-semibold">127</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Conversaciones activas</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tiempo respuesta promedio</span>
                <span className="font-semibold">2.3 min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Miembros activos</span>
                <span className="font-semibold">12</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}