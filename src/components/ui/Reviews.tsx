import React, { useState, useEffect } from 'react'
import { Star, ThumbsUp, MessageCircle, User, Filter } from 'lucide-react'
import { Button } from './button'
import { Card } from './card'
import { Textarea } from './textarea'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  comment: string
  createdAt: string
  helpful: number
  verified: boolean
  images?: string[]
}

interface ReviewsProps {
  productId: string
  className?: string
}

export function Reviews({ productId, className }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'helpful'>('newest')

  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: ''
  })

  useEffect(() => {
    loadReviews()
  }, [productId])

  const loadReviews = async () => {
    try {
      setLoading(true)
      // Simulated reviews for demo
      const mockReviews: Review[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'María García',
          rating: 5,
          title: '¡Excelente calidad!',
          comment: 'El producto llegó exactamente como se veía en la foto. La calidad de impresión es increíble y el material se siente muy bien.',
          createdAt: '2024-12-01',
          helpful: 12,
          verified: true
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Carlos Ruiz',
          rating: 4,
          title: 'Muy contento con la compra',
          comment: 'El diseño personalizado quedó perfecto. Solo le doy 4 estrellas porque tardó un poco más de lo esperado en llegar.',
          createdAt: '2024-11-28',
          helpful: 8,
          verified: true
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'Ana López',
          rating: 5,
          title: 'Recomendado 100%',
          comment: 'Es mi segunda compra y como siempre, excelente servicio. El equipo de Lovilike es muy profesional.',
          createdAt: '2024-11-25',
          helpful: 15,
          verified: true
        }
      ]
      setReviews(mockReviews)
    } catch (error) {
      toast.error('Error al cargar las reseñas')
    } finally {
      setLoading(false)
    }
  }

  const submitReview = async () => {
    if (!newReview.title.trim() || !newReview.comment.trim()) {
      toast.error('Por favor completa todos los campos')
      return
    }

    try {
      // Simulate API call
      const review: Review = {
        id: Date.now().toString(),
        userId: 'current-user',
        userName: 'Usuario Actual',
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        createdAt: new Date().toISOString().split('T')[0],
        helpful: 0,
        verified: false
      }

      setReviews([review, ...reviews])
      setNewReview({ rating: 5, title: '', comment: '' })
      setShowReviewForm(false)
      toast.success('Reseña enviada correctamente')
    } catch (error) {
      toast.error('Error al enviar la reseña')
    }
  }

  const markHelpful = (reviewId: string) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, helpful: review.helpful + 1 }
        : review
    ))
    toast.success('¡Gracias por tu feedback!')
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  const filteredReviews = reviews
    .filter(review => filterRating ? review.rating === filterRating : true)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'helpful':
          return b.helpful - a.helpful
        default:
          return 0
      }
    })

  const distribution = getRatingDistribution()

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Reviews Summary */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {getAverageRating()}
            </div>
            <div className="flex justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'w-6 h-6',
                    star <= Math.round(Number(getAverageRating()))
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <p className="text-gray-600">
              Basado en {reviews.length} reseña{reviews.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm w-8">{rating}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{
                      width: `${reviews.length > 0 ? (distribution[rating as keyof typeof distribution] / reviews.length) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">
                  {distribution[rating as keyof typeof distribution]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <select
            value={filterRating || ''}
            onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Todas las calificaciones</option>
            <option value="5">5 estrellas</option>
            <option value="4">4 estrellas</option>
            <option value="3">3 estrellas</option>
            <option value="2">2 estrellas</option>
            <option value="1">1 estrella</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguas</option>
            <option value="helpful">Más útiles</option>
          </select>
        </div>

        <Button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-gradient-to-r from-primary-500 to-secondary-500"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Escribir reseña
        </Button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <Card className="p-6 border-primary-200 bg-primary-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Escribir una reseña
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calificación
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="p-1"
                  >
                    <Star
                      className={cn(
                        'w-6 h-6 transition-colors',
                        star <= newReview.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 hover:text-yellow-200'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la reseña
              </label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Resumen de tu experiencia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentario
              </label>
              <Textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="min-h-[100px]"
                placeholder="Cuéntanos tu experiencia con este producto..."
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={submitReview}>
                Publicar reseña
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowReviewForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                {review.userName.charAt(0)}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900">{review.userName}</h4>
                  {review.verified && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      ✓ Compra verificada
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          'w-4 h-4',
                          star <= review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>

                <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                <p className="text-gray-700 mb-3">{review.comment}</p>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => markHelpful(review.id)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Útil ({review.helpful})
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filterRating ? 'No hay reseñas con esta calificación' : 'No hay reseñas todavía'}
            </h3>
            <p className="text-gray-500">
              {filterRating ? 'Prueba con otro filtro' : 'Sé el primero en escribir una reseña'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}