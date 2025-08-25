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

  // Datos de prueba temporales para desarrollo
  const mockRecibos = [
    {
      ReciboId: 1,
      NumeroRecibo: 'REC-2025-001',
      ClienteNombre: 'Juan Pérez García',
      FechaGeneracion: '2025-01-15T10:30:00.000Z',
      MontoPagado: 1250.50,
      SaldoPendiente: 0,
      EstadoPago: 'Cancelado',
      Estado: 'procesado',
      TipoPago: 'Efectivo'
    },
    {
      ReciboId: 2,
      NumeroRecibo: 'REC-2025-002',
      ClienteNombre: 'María López Rodríguez',
      FechaGeneracion: '2025-01-16T14:15:00.000Z',
      MontoPagado: 850.75,
      SaldoPendiente: 200.25,
      EstadoPago: 'Parcial',
      Estado: 'procesado',
      TipoPago: 'Transferencia'
    },
    {
      ReciboId: 3,
      NumeroRecibo: 'REC-2025-003',
      ClienteNombre: 'Carlos Mendoza Silva',
      FechaGeneracion: '2025-01-17T09:45:00.000Z',
      MontoPagado: 0,
      SaldoPendiente: 1500.00,
      EstadoPago: 'Pendiente',
      Estado: 'procesado',
      TipoPago: 'Crédito'
    },
    {
      ReciboId: 4,
      NumeroRecibo: 'REC-2025-004',
      ClienteNombre: 'Ana Torres Vega',
      FechaGeneracion: '2025-01-18T16:20:00.000Z',
      MontoPagado: 2100.00,
      SaldoPendiente: 0,
      EstadoPago: 'Cancelado',
      Estado: 'procesado',
      TipoPago: 'Tarjeta'
    },
    {
      ReciboId: 5,
      NumeroRecibo: 'REC-2025-005',
      ClienteNombre: 'Roberto Castillo Morales',
      FechaGeneracion: '2025-01-19T11:10:00.000Z',
      MontoPagado: 750.25,
      SaldoPendiente: 0,
      EstadoPago: 'Cancelado',
      Estado: 'procesado',
      TipoPago: 'Efectivo'
    }
  ]

  // Función para obtener todos los recibos con filtros opcionales
  const obtenerRecibos = async (filtros: FiltrosRecibos = {}) => {
    try {
      recibosState.loading = true
      recibosState.error = null
      
      console.log('🔍 Obteniendo recibos con filtros:', filtros)
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Intentar llamar a la API real primero
      try {
        // Construir query parameters
        const queryParams = new URLSearchParams()
        Object.entries(filtros).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString())
          }
        })
        
        const endpoint = `/recibo-digital${queryParams.toString() ? '?' + queryParams.toString() : ''}`
        console.log('📡 Intentando llamar API real:', `${API_BASE_URL}${endpoint}`)
        
        const response = await apiRequest(endpoint)
        console.log('📥 Respuesta de la API real:', response)
        
        if (response.success) {
          recibosState.recibos = response.data || []
          recibosState.totalCount = response.totalRecords || 0
          console.log('✅ Recibos cargados desde API real:', recibosState.recibos.length)
          return {
            success: true,
            data: response.data || [],
            totalRecords: response.totalRecords || 0
          }
        }
      } catch (apiError) {
        console.log('⚠️ API real no disponible, usando datos de prueba')
      }
      
      // Si la API falla, usar datos de prueba
      console.log('🧪 Usando datos de prueba para desarrollo')
      
      // Filtrar datos de prueba por fecha si se especifica
      let filteredData = [...mockRecibos]
      
      if (filtros.fechaInicio || filtros.fechaFin) {
        filteredData = mockRecibos.filter(recibo => {
          const fechaRecibo = new Date(recibo.FechaGeneracion)
          const fechaInicio = filtros.fechaInicio ? new Date(filtros.fechaInicio) : null
          const fechaFin = filtros.fechaFin ? new Date(filtros.fechaFin) : null
          
          if (fechaInicio && fechaRecibo < fechaInicio) return false
          if (fechaFin && fechaRecibo > fechaFin) return false
          
          return true
        })
      }
      
      recibosState.recibos = filteredData
      recibosState.totalCount = filteredData.length
      
      console.log('✅ Datos de prueba cargados:', filteredData.length, 'recibos')
      
      return {
        success: true,
        data: filteredData,
        totalRecords: filteredData.length
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
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Intentar llamar a la API real primero
      try {
        const queryParams = new URLSearchParams()
        Object.entries(filtros).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString())
          }
        })
        
        const endpoint = `/recibo-digital/estadisticas${queryParams.toString() ? '?' + queryParams.toString() : ''}`
        console.log('📡 Intentando llamar API estadísticas:', `${API_BASE_URL}${endpoint}`)
        
        const response = await apiRequest(endpoint)
        console.log('📥 Respuesta estadísticas real:', response)
        
        if (response.success) {
          recibosState.estadisticas = response.data
          return {
            success: true,
            data: response.data
          }
        }
      } catch (apiError) {
        console.log('⚠️ API estadísticas no disponible, calculando desde datos de prueba')
      }
      
      // Si la API falla, calcular estadísticas desde los datos actuales
      const recibosParaEstadisticas = recibosState.recibos.length > 0 ? recibosState.recibos : mockRecibos
      
      const estadisticasMock = {
        totalRecibos: recibosParaEstadisticas.length,
        totalIngresos: recibosParaEstadisticas.reduce((sum, r) => sum + (parseFloat(r.MontoPagado?.toString() || '0') || 0), 0),
        totalPendiente: recibosParaEstadisticas.reduce((sum, r) => sum + (parseFloat(r.SaldoPendiente?.toString() || '0') || 0), 0),
        recibosCancelados: recibosParaEstadisticas.filter(r => r.EstadoPago === 'Cancelado').length,
        recibosPendientes: recibosParaEstadisticas.filter(r => r.EstadoPago === 'Pendiente').length,
        recibosParciales: recibosParaEstadisticas.filter(r => r.EstadoPago === 'Parcial').length
      }
      
      recibosState.estadisticas = estadisticasMock
      console.log('✅ Estadísticas calculadas desde datos de prueba:', estadisticasMock)
      
      return {
        success: true,
        data: estadisticasMock
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