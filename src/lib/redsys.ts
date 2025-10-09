/**
 * Librería para integración con Redsys TPV Virtual
 * Implementa la funcionalidad completa para pagos con tarjeta
 */

import crypto from 'crypto'

export interface RedsysConfig {
  merchantCode: string
  terminal: string
  secretKey: string
  mode: 'test' | 'live'
}

export interface PaymentData {
  amount: number // En euros
  orderId: string
  merchantUrl?: string
  urlOk?: string
  urlKo?: string
  currency?: string
  transactionType?: string
  productDescription?: string
  customerName?: string
  customerEmail?: string
}

export interface RedsysResponse {
  success: boolean
  redirectUrl?: string
  formData?: {
    Ds_SignatureVersion: string
    Ds_MerchantParameters: string
    Ds_Signature: string
  }
  error?: string
}

/**
 * Clase principal para manejar pagos con Redsys
 */
export class RedsysPayment {
  private config: RedsysConfig

  constructor(config: RedsysConfig) {
    this.config = config
  }

  /**
   * Obtiene la URL base según el modo (test/live)
   */
  private getBaseUrl(): string {
    return this.config.mode === 'test' 
      ? 'https://sis-t.redsys.es:25443'
      : 'https://sis.redsys.es'
  }

  /**
   * Genera la firma HMAC SHA256 Base64
   */
  private generateSignature(merchantParameters: string): string {
    try {
      // Decodificar la clave secreta
      const key = Buffer.from(this.config.secretKey, 'base64')
      
      // Crear HMAC SHA256
      const hmac = crypto.createHmac('sha256', key)
      hmac.update(merchantParameters)
      
      return hmac.digest('base64')
    } catch (error) {
      throw new Error(`Error generando firma: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Valida los parámetros de entrada
   */
  private validatePaymentData(data: PaymentData): void {
    if (!data.amount || data.amount <= 0) {
      throw new Error('El importe debe ser mayor que 0')
    }
    
    if (!data.orderId || data.orderId.length < 4 || data.orderId.length > 12) {
      throw new Error('El ID de pedido debe tener entre 4 y 12 caracteres')
    }

    // Validar formato de orderId (debe ser alfanumérico)
    if (!/^[a-zA-Z0-9]+$/.test(data.orderId)) {
      throw new Error('El ID de pedido solo puede contener letras y números')
    }

    if (!this.config.merchantCode || !/^\d{9}$/.test(this.config.merchantCode)) {
      throw new Error('Código de comercio debe tener 9 dígitos')
    }

    if (!this.config.terminal || !/^\d{1,3}$/.test(this.config.terminal)) {
      throw new Error('Terminal debe ser un número entre 1-999')
    }

    if (!this.config.secretKey || this.config.secretKey.length < 32) {
      throw new Error('Clave secreta requerida')
    }
  }

  /**
   * Crea los parámetros del comerciante
   */
  private createMerchantParameters(data: PaymentData): string {
    this.validatePaymentData(data)

    // Convertir euros a céntimos
    const amountInCents = Math.round(data.amount * 100)

    // Parámetros base requeridos por Redsys
    const params: any = {
      DS_MERCHANT_AMOUNT: amountInCents.toString(),
      DS_MERCHANT_ORDER: data.orderId,
      DS_MERCHANT_MERCHANTCODE: this.config.merchantCode,
      DS_MERCHANT_CURRENCY: data.currency || '978', // EUR por defecto
      DS_MERCHANT_TRANSACTIONTYPE: data.transactionType || '0', // Autorización
      DS_MERCHANT_TERMINAL: this.config.terminal,
      DS_MERCHANT_MERCHANTNAME: 'Lovilike'
    }

    // URLs opcionales
    if (data.merchantUrl) {
      params.DS_MERCHANT_MERCHANTURL = data.merchantUrl
    }
    
    if (data.urlOk) {
      params.DS_MERCHANT_URLOK = data.urlOk
    }
    
    if (data.urlKo) {
      params.DS_MERCHANT_URLKO = data.urlKo
    }

    // Información adicional
    if (data.productDescription) {
      params.DS_MERCHANT_PRODUCTDESCRIPTION = data.productDescription.substring(0, 125)
    }

    if (data.customerName) {
      params.DS_MERCHANT_TITULAR = data.customerName.substring(0, 60)
    }

    // Codificar en Base64
    return Buffer.from(JSON.stringify(params)).toString('base64')
  }

  /**
   * Crea el formulario de pago para redirigir a Redsys
   */
  public async createPaymentForm(data: PaymentData): Promise<RedsysResponse> {
    try {
      const merchantParameters = this.createMerchantParameters(data)
      const signature = this.generateSignature(merchantParameters)
      
      return {
        success: true,
        redirectUrl: `${this.getBaseUrl()}/sis/realizarPago`,
        formData: {
          Ds_SignatureVersion: 'HMAC_SHA256_V1',
          Ds_MerchantParameters: merchantParameters,
          Ds_Signature: signature
        }
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Verifica la respuesta de Redsys (webhook)
   */
  public verifyResponse(
    merchantParameters: string, 
    signature: string, 
    signatureVersion: string = 'HMAC_SHA256_V1'
  ): { valid: boolean; data?: any; error?: string } {
    try {
      // Verificar versión de firma
      if (signatureVersion !== 'HMAC_SHA256_V1') {
        return { valid: false, error: 'Versión de firma no soportada' }
      }

      // Generar firma esperada
      const expectedSignature = this.generateSignature(merchantParameters)
      
      // Comparar firmas
      if (signature !== expectedSignature) {
        return { valid: false, error: 'Firma inválida' }
      }

      // Decodificar parámetros
      const decodedParams = JSON.parse(Buffer.from(merchantParameters, 'base64').toString())
      
      return {
        valid: true,
        data: decodedParams
      }

    } catch (error) {
      return {
        valid: false,
        error: `Error verificando respuesta: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }
    }
  }

  /**
   * Interpreta el código de respuesta de Redsys
   */
  public interpretResponseCode(code: string): { 
    success: boolean
    message: string
    category: 'success' | 'denied' | 'error'
  } {
    const numCode = parseInt(code)
    
    if (numCode >= 0 && numCode <= 99) {
      return {
        success: true,
        message: 'Transacción autorizada',
        category: 'success'
      }
    }
    
    if (numCode >= 100 && numCode <= 199) {
      return {
        success: false,
        message: 'Transacción denegada',
        category: 'denied'
      }
    }
    
    if (numCode >= 200) {
      return {
        success: false,
        message: 'Error en la transacción',
        category: 'error'
      }
    }
    
    // Códigos específicos más comunes
    const specificCodes: Record<string, { message: string; category: 'success' | 'denied' | 'error' }> = {
      '0000': { message: 'Transacción autorizada para pagos y preautorizaciones', category: 'success' },
      '0180': { message: 'Tarjeta ajena al servicio', category: 'denied' },
      '0184': { message: 'Error en la autenticación del titular', category: 'denied' },
      '0190': { message: 'Denegación del emisor sin especificar motivo', category: 'denied' },
      '0191': { message: 'Fecha de caducidad errónea', category: 'denied' },
      '0202': { message: 'Tarjeta en excepción transitoria o bajo sospecha de fraude', category: 'denied' },
      '0904': { message: 'Comercio no registrado en FUC', category: 'error' },
      '0909': { message: 'Error de sistema', category: 'error' },
      '0912': { message: 'Emisor no disponible', category: 'error' }
    }
    
    return specificCodes[code] || {
      success: false,
      message: `Código de respuesta desconocido: ${code}`,
      category: 'error'
    }
  }
}

/**
 * Factory para crear instancia de RedsysPayment desde configuración de BD
 */
export async function createRedsysPayment(prisma: any): Promise<RedsysPayment | null> {
  try {
    // Obtener configuración de Redsys desde la BD
    const redsysSettings = await prisma.setting.findMany({
      where: {
        key: {
          startsWith: 'payment_redsys_'
        }
      }
    })

    if (redsysSettings.length === 0) {
      return null
    }

    // Construir configuración
    const config: RedsysConfig = {
      merchantCode: '',
      terminal: '1',
      secretKey: '',
      mode: 'test'
    }

    redsysSettings.forEach(setting => {
      const field = setting.key.replace('payment_redsys_', '')
      try {
        const value = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value
        if (field in config) {
          (config as any)[field] = value
        }
      } catch (error) {
        console.error('Error parsing Redsys setting:', error)
      }
    })

    // Verificar que tenemos la configuración mínima
    if (!config.merchantCode || !config.secretKey) {
      return null
    }

    return new RedsysPayment(config)
  } catch (error) {
    console.error('Error creating Redsys payment:', error)
    return null
  }
}