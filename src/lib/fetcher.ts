const fetcher = async (url: string) => {
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error('Error al obtener los datos')
  }
  
  return response.json()
}

export default fetcher