const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include', // Incluye las cookies de sesión automáticamente
    headers: {
      'Content-Type': 'application/json',
    }
  })
  
  if (!response.ok) {
    // Obtener más detalles del error
    let errorMessage = 'Error al obtener los datos'
    try {
      const errorData = await response.json()
      errorMessage = errorData.error?.message || errorData.message || errorMessage
    } catch {
      // Si no se puede parsear el JSON, usar el status text
      errorMessage = `Error ${response.status}: ${response.statusText}`
    }
    
    throw new Error(errorMessage)
  }
  
  return response.json()
}

export default fetcher