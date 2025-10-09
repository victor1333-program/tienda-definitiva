import {
  AppError,
  ERROR_CODES,
  createSuccessResponse,
  createErrorResponse,
  validateRequiredFields,
  validateDataTypes,
  withDatabaseErrorHandling
} from '../error-handler'

describe('error-handler', () => {
  describe('AppError', () => {
    it('should create an error with correct properties', () => {
      const error = new AppError(ERROR_CODES.VALIDATION_ERROR, 'Test message')
      
      expect(error.message).toBe('Test message')
      expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      expect(error.statusCode).toBe(400)
      expect(error.timestamp).toBeDefined()
      expect(error.name).toBe('AppError')
    })

    it('should use default message when none provided', () => {
      const error = new AppError(ERROR_CODES.NOT_FOUND)
      
      expect(error.message).toBe('El recurso solicitado no fue encontrado')
    })

    it('should include details when provided', () => {
      const details = { field: 'email', value: 'invalid' }
      const error = new AppError(ERROR_CODES.VALIDATION_ERROR, 'Invalid email', details)
      
      expect(error.details).toEqual(details)
    })
  })

  describe('createSuccessResponse', () => {
    it('should create a success response with data', () => {
      const data = { id: 1, name: 'Test' }
      const response = createSuccessResponse(data)
      
      expect(response.success).toBe(true)
      expect(response.data).toEqual(data)
      expect(response.meta?.requestId).toBeDefined()
      expect(response.meta?.timestamp).toBeDefined()
    })

    it('should include meta information when provided', () => {
      const data = { items: [] }
      const meta = { pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } }
      const response = createSuccessResponse(data, meta)
      
      expect(response.meta?.pagination).toEqual(meta.pagination)
    })
  })

  describe('createErrorResponse', () => {
    it('should create an error response from AppError', () => {
      const error = new AppError(ERROR_CODES.NOT_FOUND, 'Resource not found')
      const response = createErrorResponse(error)
      
      expect(response.success).toBe(false)
      expect(response.error?.code).toBe(ERROR_CODES.NOT_FOUND)
      expect(response.error?.message).toBe('Resource not found')
      expect(response.error?.statusCode).toBe(404)
      expect(response.meta?.requestId).toBeDefined()
    })

    it('should create an error response from generic Error', () => {
      const error = new Error('Generic error')
      const response = createErrorResponse(error)
      
      expect(response.success).toBe(false)
      expect(response.error?.code).toBe(ERROR_CODES.INTERNAL_ERROR)
      expect(response.error?.message).toBe('Generic error')
      expect(response.error?.statusCode).toBe(500)
    })
  })

  describe('validateRequiredFields', () => {
    it('should pass validation when all fields are present', () => {
      const data = { name: 'Test', email: 'test@test.com' }
      const requiredFields = ['name', 'email']
      
      expect(() => validateRequiredFields(data, requiredFields)).not.toThrow()
    })

    it('should throw error when required field is missing', () => {
      const data = { name: 'Test' }
      const requiredFields = ['name', 'email']
      
      expect(() => validateRequiredFields(data, requiredFields))
        .toThrow('Campos requeridos faltantes: email')
    })

    it('should throw error when field is empty string', () => {
      const data = { name: '', email: 'test@test.com' }
      const requiredFields = ['name', 'email']
      
      expect(() => validateRequiredFields(data, requiredFields))
        .toThrow('Campos requeridos faltantes: name')
    })

    it('should throw error when field is null', () => {
      const data = { name: null, email: 'test@test.com' }
      const requiredFields = ['name', 'email']
      
      expect(() => validateRequiredFields(data, requiredFields))
        .toThrow('Campos requeridos faltantes: name')
    })
  })

  describe('validateDataTypes', () => {
    it('should pass validation when all types are correct', () => {
      const data = { name: 'Test', age: 25, active: true, tags: ['tag1'] }
      const schema = { name: 'string', age: 'number', active: 'boolean', tags: 'array' }
      
      expect(() => validateDataTypes(data, schema)).not.toThrow()
    })

    it('should throw error when type is incorrect', () => {
      const data = { name: 123, age: '25' }
      const schema = { name: 'string', age: 'number' }
      
      expect(() => validateDataTypes(data, schema))
        .toThrow('Tipos de datos inválidos')
    })

    it('should ignore undefined fields', () => {
      const data = { name: 'Test' }
      const schema = { name: 'string', age: 'number' }
      
      expect(() => validateDataTypes(data, schema)).not.toThrow()
    })

    it('should correctly identify arrays', () => {
      const data = { tags: ['tag1', 'tag2'] }
      const schema = { tags: 'array' }
      
      expect(() => validateDataTypes(data, schema)).not.toThrow()
    })
  })

  describe('withDatabaseErrorHandling', () => {
    it('should execute operation successfully', async () => {
      const operation = jest.fn().mockResolvedValue('success')
      
      const result = await withDatabaseErrorHandling(operation)
      
      expect(result).toBe('success')
      expect(operation).toHaveBeenCalled()
    })

    it('should handle P2002 (unique constraint) error', async () => {
      const operation = jest.fn().mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] }
      })
      
      await expect(withDatabaseErrorHandling(operation))
        .rejects.toThrow('El recurso ya existe con estos datos únicos')
    })

    it('should handle P2025 (record not found) error', async () => {
      const operation = jest.fn().mockRejectedValue({
        code: 'P2025'
      })
      
      await expect(withDatabaseErrorHandling(operation))
        .rejects.toThrow('El recurso no fue encontrado')
    })

    it('should handle generic database errors', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Connection failed'))
      
      await expect(withDatabaseErrorHandling(operation))
        .rejects.toThrow('Error en la operación de base de datos')
    })
  })
})