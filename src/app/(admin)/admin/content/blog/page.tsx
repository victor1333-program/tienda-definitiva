"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, Plus, Search, Eye, Edit3, Trash2, 
  Calendar, User, Tag, BookOpen, TrendingUp,
  Save, Image, Link as LinkIcon, Upload
} from "lucide-react"
import { toast } from "react-hot-toast"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string
  status: 'draft' | 'published' | 'scheduled'
  publishedAt?: Date
  authorId: string
  authorName: string
  tags: string[]
  category: string
  seoTitle?: string
  seoDescription?: string
  readingTime: number
  views: number
  createdAt: Date
  updatedAt: Date
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string
  postCount: number
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: '1',
      title: 'Tendencias en Bodas 2024: Productos Personalizados que Marcan la Diferencia',
      slug: 'tendencias-bodas-2024-productos-personalizados',
      excerpt: 'Descubre las últimas tendencias en productos personalizados para bodas que están marcando la diferencia en 2024.',
      content: 'Contenido del artículo...',
      status: 'published',
      publishedAt: new Date('2024-01-15'),
      authorId: '1',
      authorName: 'Admin',
      tags: ['bodas', 'tendencias', '2024', 'personalización'],
      category: 'Bodas',
      readingTime: 5,
      views: 245,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Cómo Elegir el Regalo Perfecto para Baby Shower',
      slug: 'como-elegir-regalo-perfecto-baby-shower',
      excerpt: 'Guía completa para elegir el regalo perfecto personalizado para baby showers.',
      content: 'Contenido del artículo...',
      status: 'draft',
      authorId: '1',
      authorName: 'Admin',
      tags: ['baby shower', 'regalos', 'guía'],
      category: 'Baby Shower',
      readingTime: 7,
      views: 0,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    }
  ])

  const [categories, setCategories] = useState<BlogCategory[]>([
    { id: '1', name: 'Bodas', slug: 'bodas', description: 'Artículos sobre bodas y productos para parejas', postCount: 15 },
    { id: '2', name: 'Baby Shower', slug: 'baby-shower', description: 'Regalos y productos para baby showers', postCount: 8 },
    { id: '3', name: 'Comuniones', slug: 'comuniones', description: 'Productos personalizados para comuniones', postCount: 12 },
    { id: '4', name: 'Consejos', slug: 'consejos', description: 'Consejos y guías de personalización', postCount: 6 }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || post.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const createNewPost = () => {
    const newPost: BlogPost = {
      id: '',
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      status: 'draft',
      authorId: '1',
      authorName: 'Admin',
      tags: [],
      category: categories[0]?.name || '',
      readingTime: 0,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setEditingPost(newPost)
    setIsCreating(true)
  }

  const savePost = async (post: BlogPost) => {
    try {
      if (isCreating) {
        const newPost = { ...post, id: Date.now().toString() }
        setPosts(prev => [...prev, newPost])
        toast.success('Artículo creado correctamente')
      } else {
        setPosts(prev => prev.map(p => p.id === post.id ? post : p))
        toast.success('Artículo actualizado correctamente')
      }
      setEditingPost(null)
      setIsCreating(false)
    } catch (error) {
      toast.error('Error al guardar el artículo')
    }
  }

  const deletePost = (postId: string) => {
    if (confirm('¿Estás seguro de eliminar este artículo?')) {
      setPosts(prev => prev.filter(p => p.id !== postId))
      toast.success('Artículo eliminado')
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const getStatusColor = (status: BlogPost['status']) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: BlogPost['status']) => {
    switch (status) {
      case 'published': return 'Publicado'
      case 'draft': return 'Borrador'
      case 'scheduled': return 'Programado'
      default: return 'Borrador'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-orange-500" />
            Gestión de Blog
          </h1>
          <p className="text-gray-600 mt-1">
            Crear y gestionar contenido del blog
          </p>
        </div>
        <Button onClick={createNewPost}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Artículo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{posts.length}</p>
                <p className="text-gray-600">Total Artículos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{posts.filter(p => p.status === 'published').length}</p>
                <p className="text-gray-600">Publicados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Edit3 className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{posts.filter(p => p.status === 'draft').length}</p>
                <p className="text-gray-600">Borradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{posts.reduce((sum, p) => sum + p.views, 0)}</p>
                <p className="text-gray-600">Total Vistas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar artículos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Todos los estados</option>
              <option value="published">Publicado</option>
              <option value="draft">Borrador</option>
              <option value="scheduled">Programado</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{post.title}</h3>
                    <Badge className={getStatusColor(post.status)}>
                      {getStatusText(post.status)}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.authorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.publishedAt?.toLocaleDateString() || 'Sin fecha'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.views} vistas
                    </span>
                    <span>{post.readingTime} min lectura</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-3">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingPost(post)}
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deletePost(post.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Editor Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">
                {isCreating ? 'Crear Nuevo Artículo' : 'Editar Artículo'}
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={editingPost.title}
                    onChange={(e) => {
                      const title = e.target.value
                      setEditingPost(prev => prev ? {
                        ...prev,
                        title,
                        slug: generateSlug(title)
                      } : null)
                    }}
                    placeholder="Título del artículo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={editingPost.slug}
                    onChange={(e) => setEditingPost(prev => prev ? {...prev, slug: e.target.value} : null)}
                    placeholder="url-del-articulo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <select
                    id="category"
                    value={editingPost.category}
                    onChange={(e) => setEditingPost(prev => prev ? {...prev, category: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <select
                    id="status"
                    value={editingPost.status}
                    onChange={(e) => setEditingPost(prev => prev ? {...prev, status: e.target.value as BlogPost['status']} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                    <option value="scheduled">Programado</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="excerpt">Extracto</Label>
                <Textarea
                  id="excerpt"
                  value={editingPost.excerpt}
                  onChange={(e) => setEditingPost(prev => prev ? {...prev, excerpt: e.target.value} : null)}
                  placeholder="Breve descripción del artículo..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="content">Contenido</Label>
                <Textarea
                  id="content"
                  value={editingPost.content}
                  onChange={(e) => setEditingPost(prev => prev ? {...prev, content: e.target.value} : null)}
                  placeholder="Contenido del artículo en Markdown..."
                  rows={12}
                  className="font-mono"
                />
              </div>
              
              <div>
                <Label htmlFor="tags">Tags (separados por comas)</Label>
                <Input
                  id="tags"
                  value={editingPost.tags.join(', ')}
                  onChange={(e) => setEditingPost(prev => prev ? {
                    ...prev,
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  } : null)}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingPost(null)
                  setIsCreating(false)
                }}
              >
                Cancelar
              </Button>
              <Button onClick={() => editingPost && savePost(editingPost)}>
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {filteredPosts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'No se encontraron artículos con los filtros aplicados'
                : 'No hay artículos creados aún'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && selectedStatus === 'all' && (
              <Button onClick={createNewPost}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Artículo
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}