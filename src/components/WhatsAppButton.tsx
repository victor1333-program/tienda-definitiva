'use client'

import { MessageCircle, Phone, ShoppingCart, Package, User, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WhatsAppButtonProps {
  message?: string
  phone?: string
  variant?: 'default' | 'outline' | 'ghost' | 'product' | 'cart' | 'support'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children?: React.ReactNode
  showIcon?: boolean
  productName?: string
  productUrl?: string
  orderNumber?: string
  userName?: string
}

const defaultPhone = '+34612345678'

const variantMessages = {
  product: (productName?: string, productUrl?: string) => 
    `¡Hola! 👋 Me interesa este producto: *${productName || 'Producto'}*\n\n${productUrl ? `Link: ${productUrl}` : ''}\n\n¿Podrías darme más información sobre personalización y precios?`,
  
  cart: (userName?: string) => 
    `¡Hola! 👋 ${userName ? `Soy ${userName} y ` : ''}Tengo algunos productos en mi carrito y me gustaría finalizar la compra.\n\n¿Podrías ayudarme con el proceso de pago y envío?`,
    
  support: (orderNumber?: string) => 
    `¡Hola! 👋 Necesito ayuda con mi ${orderNumber ? `pedido #${orderNumber}` : 'pedido'}.\n\n¿Podrían ayudarme por favor?`,
    
  default: () => 
    `¡Hola! 👋 Me gustaría obtener más información sobre sus productos personalizados.`
}

const variantStyles = {
  default: 'bg-green-600 hover:bg-green-700 text-white',
  outline: 'border-green-600 text-green-600 hover:bg-green-50',
  ghost: 'text-green-600 hover:bg-green-50',
  product: 'bg-green-600 hover:bg-green-700 text-white shadow-lg',
  cart: 'bg-orange-600 hover:bg-orange-700 text-white',
  support: 'bg-blue-600 hover:bg-blue-700 text-white'
}

const variantIcons = {
  default: MessageCircle,
  outline: MessageCircle,
  ghost: MessageCircle,
  product: Heart,
  cart: ShoppingCart,
  support: Phone
}

export default function WhatsAppButton({
  message,
  phone = defaultPhone,
  variant = 'default',
  size = 'md',
  className = '',
  children,
  showIcon = true,
  productName,
  productUrl,
  orderNumber,
  userName
}: WhatsAppButtonProps) {
  
  const formatPhoneForURL = (phoneNumber: string) => {
    return phoneNumber.replace(/[^\d+]/g, '')
  }

  const getDefaultMessage = () => {
    switch (variant) {
      case 'product':
        return variantMessages.product(productName, productUrl)
      case 'cart':
        return variantMessages.cart(userName)
      case 'support':
        return variantMessages.support(orderNumber)
      default:
        return variantMessages.default()
    }
  }

  const handleClick = () => {
    const finalMessage = message || getDefaultMessage()
    const encodedMessage = encodeURIComponent(finalMessage)
    const phoneFormatted = formatPhoneForURL(phone)
    const whatsappURL = `https://wa.me/${phoneFormatted}?text=${encodedMessage}`
    
    window.open(whatsappURL, '_blank')

    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'whatsapp_button_click', {
        event_category: 'engagement',
        event_label: variant,
        value: productName || orderNumber || 'general'
      })
    }
  }

  const IconComponent = variantIcons[variant]
  const buttonStyles = variantStyles[variant]

  const defaultTexts = {
    default: 'Contactar por WhatsApp',
    outline: 'Chatea con nosotros',
    ghost: 'WhatsApp',
    product: 'Consultar por WhatsApp',
    cart: 'Finalizar por WhatsApp',
    support: 'Soporte por WhatsApp'
  }

  return (
    <Button
      onClick={handleClick}
      variant={variant === 'default' ? 'default' : 'outline'}
      size={size}
      className={`${buttonStyles} transition-all duration-200 hover:scale-105 ${className}`}
    >
      {showIcon && <IconComponent className="w-4 h-4 mr-2" />}
      {children || defaultTexts[variant]}
    </Button>
  )
}

// Componentes especializados para casos específicos
export function WhatsAppProductButton({ 
  productName, 
  productUrl, 
  className = '',
  size = 'md' 
}: { 
  productName: string
  productUrl?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  return (
    <WhatsAppButton
      variant="product"
      productName={productName}
      productUrl={productUrl}
      size={size}
      className={className}
    >
      <Heart className="w-4 h-4 mr-2" />
      Me interesa este producto
    </WhatsAppButton>
  )
}

export function WhatsAppCartButton({ 
  userName,
  className = '',
  size = 'md'
}: { 
  userName?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  return (
    <WhatsAppButton
      variant="cart"
      userName={userName}
      size={size}
      className={className}
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      Finalizar compra por WhatsApp
    </WhatsAppButton>
  )
}

export function WhatsAppSupportButton({ 
  orderNumber,
  className = '',
  size = 'md'
}: { 
  orderNumber?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  return (
    <WhatsAppButton
      variant="support"
      orderNumber={orderNumber}
      size={size}
      className={className}
    >
      <Phone className="w-4 h-4 mr-2" />
      Soporte por WhatsApp
    </WhatsAppButton>
  )
}

export function WhatsAppContactButton({ 
  className = '',
  size = 'md',
  message
}: { 
  className?: string
  size?: 'sm' | 'md' | 'lg'
  message?: string
}) {
  return (
    <WhatsAppButton
      message={message}
      size={size}
      className={className}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      Contactar por WhatsApp
    </WhatsAppButton>
  )
}