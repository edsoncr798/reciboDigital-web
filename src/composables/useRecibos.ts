import { ref, computed, reactive } from 'vue'
import type { 
  ReciboDigital, 
  ReciboDigitalInput
} from '@/lib/database.types'

// Base URL de la API externa
const API_BASE_URL = 'https://api.comsanjuan.com:8443/api'

// Estado global reactivo para recibos
const recibosState = reactive({
  recibos: [] as any[],
  loading: false,
  error: null as string | null,
  totalCount: 0,
  estadisticas: null as any
})

// Filtros para búsqueda según la API
interface FiltrosRecibos {
  fechaInicio?: string
  fechaFin?: string
  idVendedor?: number
  tipoPago?: string
  estado?: string
  numeroRecibo?: string
  clienteNombre?: string
}

// Función auxiliar para manejar errores de la API
const handleApiError = (error: any) => {
  console.error('Error de API:', error)
  if (error.response) {
    return error.response.data?.message || 'Error en la respuesta del servidor'
  } else if (error.request) {
    return 'No se pudo conectar con el servidor'
  } else {
    return error.message || 'Error desconocido'
  }
}

// Función auxiliar para realizar peticiones HTTP
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  const response = await fetch(url, {
    ...options,
    headers: defaultHeaders
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
  }
  
  return response.json()
}

export const useRecibos = () => {
  // Getters computados
  const recibosActivos = computed(() => {
    return recibosState.recibos.filter(recibo => recibo.EstadoPago === 'procesado')
  })
  
  const recibosPendientes = computed(() => {
    return recibosState.recibos.filter(recibo => recibo.EstadoPago === 'pendiente')
  })
  
  const recibosCancelados = computed(() => {
    return recibosState.recibos.filter(recibo => recibo.EstadoPago === 'cancelado')
  })
  
  const totalIngresos = computed(() => {
    return recibosState.recibos
      .filter(recibo => recibo.EstadoPago === 'procesado')
      .reduce((total, recibo) => total + parseFloat(recibo.MontoPagado || 0), 0)
  })

  // Función para obtener todos los recibos con filtros opcionales
  const obtenerRecibos = async (filtros: FiltrosRecibos = {}) => {
    try {
      recibosState.loading = true
      recibosState.error = null
      
      console.log('🔍 Obteniendo recibos con filtros:', filtros)
      
      // Construir query parameters
      const queryParams = new URLSearchParams()
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })
      
      const endpoint = `/recibo-digital${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      console.log('📡 Llamando endpoint:', `${API_BASE_URL}${endpoint}`)
      
      const response = await apiRequest(endpoint)
      console.log('📥 Respuesta de la API:', response)
      
      if (response.success) {
        recibosState.recibos = response.data || []
        recibosState.totalCount = response.totalRecords || 0
        console.log('✅ Recibos cargados exitosamente:', recibosState.recibos.length)
        return {
          success: true,
          data: response.data || [],
          totalRecords: response.totalRecords || 0
        }
      } else {
        console.error('❌ Error en respuesta de API:', response.message)
        return {
          success: false,
          error: response.message || 'Error al obtener recibos',
          data: []
        }
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error)
      recibosState.error = errorMessage
      console.error('💥 Error obteniendo recibos:', error)
      return {
        success: false,
        error: errorMessage,
        data: []
      }
    } finally {
      recibosState.loading = false
    }
  }

  // Función para obtener un recibo por número de recibo
  const obtenerReciboPorNumero = async (numeroRecibo: string) => {
    try {
      recibosState.loading = true
      recibosState.error = null
      
      const response = await apiRequest(`/recibo-digital/${encodeURIComponent(numeroRecibo)}`)
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || 'Recibo no encontrado')
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error)
      recibosState.error = errorMessage
      console.error('Error obteniendo recibo:', error)
      throw new Error(errorMessage)
    } finally {
      recibosState.loading = false
    }
  }



  // Función para búsqueda avanzada de recibos
  const buscarRecibosAvanzado = async (filtros: FiltrosRecibos) => {
    try {
      recibosState.loading = true
      recibosState.error = null
      
      const response = await apiRequest('/recibo-digital/buscar', {
        method: 'POST',
        body: JSON.stringify(filtros)
      })
      
      if (response.success) {
        recibosState.recibos = response.data || []
        return response.data
      } else {
        throw new Error(response.message || 'Error en la búsqueda')
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error)
      recibosState.error = errorMessage
      console.error('Error en búsqueda avanzada:', error)
      throw new Error(errorMessage)
    } finally {
      recibosState.loading = false
    }
  }

  // Función para obtener estadísticas
  const obtenerEstadisticas = async (filtros: Partial<FiltrosRecibos> = {}) => {
    try {
      console.log('📊 Obteniendo estadísticas con filtros:', filtros)
      
      const queryParams = new URLSearchParams()
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })
      
      const endpoint = `/recibo-digital/estadisticas${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      console.log('📡 Llamando endpoint estadísticas:', `${API_BASE_URL}${endpoint}`)
      
      const response = await apiRequest(endpoint)
      console.log('📥 Respuesta estadísticas:', response)
      
      if (response.success) {
        recibosState.estadisticas = response.data
        return {
          success: true,
          data: response.data
        }
      } else {
        console.error('❌ Error en estadísticas:', response.message)
        return {
          success: false,
          error: response.message || 'Error al obtener estadísticas',
          data: null
        }
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error)
      recibosState.error = errorMessage
      console.error('💥 Error obteniendo estadísticas:', error)
      return {
        success: false,
        error: errorMessage,
        data: null
      }
    }
  }

  // Función para buscar recibos por texto (número de recibo o cliente)
  const buscarRecibos = async (texto: string) => {
    try {
      recibosState.loading = true
      recibosState.error = null
      
      if (!texto.trim()) {
        return []
      }
      
      // Buscar por número de recibo o nombre de cliente
      const filtros: FiltrosRecibos = {}
      
      // Si parece un número de recibo, buscar por número
      if (texto.match(/^[A-Z0-9-]+$/i)) {
        filtros.numeroRecibo = texto
      } else {
        // Si no, buscar por nombre de cliente
        filtros.clienteNombre = texto
      }
      
      return await buscarRecibosAvanzado(filtros)
    } catch (error: any) {
      const errorMessage = handleApiError(error)
      recibosState.error = errorMessage
      console.error('Error buscando recibos:', error)
      throw new Error(errorMessage)
    } finally {
      recibosState.loading = false
    }
  }

  // Función para limpiar errores
  const limpiarError = () => {
    recibosState.error = null
  }

  return {
    // Estado reactivo
    recibos: computed(() => recibosState.recibos),
    loading: computed(() => recibosState.loading),
    error: computed(() => recibosState.error),
    totalCount: computed(() => recibosState.totalCount),
    estadisticas: computed(() => recibosState.estadisticas),
    
    // Getters computados
    recibosActivos,
    recibosPendientes,
    recibosCancelados,
    totalIngresos,
    
    // Acciones
    obtenerRecibos,
    obtenerReciboPorNumero,
    buscarRecibos,
    buscarRecibosAvanzado,
    obtenerEstadisticas,
    limpiarError
  }
}