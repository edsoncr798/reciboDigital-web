import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Funciones utilitarias para manejo de fechas en zona horaria de Perú

/**
 * Convierte una fecha UTC a la zona horaria de Perú y la formatea como fecha
 * @param dateString - Fecha en formato ISO string (UTC)
 * @returns Fecha formateada en zona horaria de Perú
 */
export const formatDatePeru = (dateString: string | Date): string => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  
  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) return ''
  
  return date.toLocaleDateString('es-PE', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * Convierte una fecha UTC a la zona horaria de Perú y la formatea como hora
 * @param dateString - Fecha en formato ISO string (UTC)
 * @returns Hora formateada en zona horaria de Perú
 */
export const formatTimePeru = (dateString: string | Date): string => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  
  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) return ''
  
  return date.toLocaleTimeString('es-PE', {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Convierte una fecha UTC a la zona horaria de Perú y la formatea como fecha y hora
 * @param dateString - Fecha en formato ISO string (UTC)
 * @returns Fecha y hora formateada en zona horaria de Perú
 */
export const formatDateTimePeru = (dateString: string | Date): string => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  
  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) return ''
  
  return date.toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Convierte una fecha UTC a la zona horaria de Perú y la formatea de forma corta para gráficos
 * @param dateString - Fecha en formato ISO string (UTC)
 * @returns Fecha formateada corta en zona horaria de Perú
 */
export const formatDateShortPeru = (dateString: string | Date): string => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  
  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) return ''
  
  return date.toLocaleDateString('es-PE', {
    timeZone: 'America/Lima',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Convierte una fecha UTC a la zona horaria de Perú y la formatea para mostrar mes y año
 * @param dateString - Fecha en formato ISO string (UTC)
 * @returns Mes y año formateado en zona horaria de Perú
 */
export const formatMonthYearPeru = (dateString: string | Date): string => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  
  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) return ''
  
  return date.toLocaleDateString('es-PE', {
    timeZone: 'America/Lima',
    month: 'short',
    year: '2-digit'
  })
}
