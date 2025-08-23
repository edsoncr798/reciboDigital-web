import { Timestamp } from 'firebase/firestore'

// Tipos base para Firebase
export type FirebaseTimestamp = Timestamp | Date
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Tipos de roles y permisos
export type UserRole = 'super_admin' | 'admin' | 'auditor'
export type UserStatus = 'activo' | 'inactivo' | 'suspendido'
export type Theme = 'claro' | 'oscuro'
export type Language = 'es' | 'en'

// Interfaz para permisos de usuario
export interface UserPermissions {
  gestionRecibos: boolean
  gestionUsuarios: boolean
  reportesAvanzados: boolean
  configuracionSistema: boolean
  auditoria: boolean
  crearAdministradores: boolean
}

// Interfaz para configuraciones de usuario
export interface UserConfigurations {
  notificaciones: boolean
  tema: Theme
  idioma: Language
}

// Interfaz principal para UserProfile
export interface UserProfile {
  uid: string
  email: string
  nombreCompleto: string
  telefono?: string
  rol: UserRole
  estado: UserStatus
  permisos: UserPermissions
  fechaCreacion: string
  fechaUltimoAcceso?: string
  creadoPor: string
  configuraciones: UserConfigurations
  avatar?: string
  departamento?: string
  notas?: string
}

// Interfaz para crear/editar usuario
export interface CreateUserProfile {
  email: string
  nombreCompleto: string
  telefono?: string
  rol: UserRole
  departamento?: string
  notas?: string
  password: string
}

// Interfaz para roles del sistema
export interface Role {
  id: string
  nombre: string
  descripcion: string
  permisos: UserPermissions
  activo: boolean
  fechaCreacion: string
  fechaModificacion?: string
}

// Interfaz para recibos digitales (basada en el stored procedure sp_ObtenerRecibosDigitales)
export interface ReciboDigital {
  // Información Básica del Recibo
  ReciboId: number
  NumeroRecibo: string
  NumeroComprobante: string
  FechaGeneracion: string
  Estado: string
  
  // Información del Cliente
  ClienteNombre: string
  ClienteDocumento?: string
  
  // Información del Vendedor
  VendedorNombre: string
  VendedorCodigo: string
  IdVendedor: number
  VendedorDni: string
  
  // Información Financiera
  SaldoTotal: number
  MontoPagado: number
  TipoPago: string
  MetodoPago: string
  NumeroCheque?: string
  NumeroCuenta?: string
  
  // Información del Documento
  TipoDocumento: string
  DiasPago?: number
  
  // Firmas Digitales (Base64)
  FirmaVendedor?: string
  FirmaCliente?: string
  
  // Campos calculados
  TipoPagoDescripcion: string
  SaldoPendiente: number
  EstadoPago: string
}

// Interfaz para usuarios de la app móvil
export interface UsuarioApp {
  id: string
  email: string
  nombreCompleto: string
  telefono?: string
  estadoCuenta: 'activo' | 'suspendido' | 'inactivo'
  configuraciones: {
    notificaciones: boolean
    sincronizacionAuto: boolean
    formatoRecibo: string
  }
  estadisticas: {
    totalRecibos: number
    montoTotalGenerado: number
    ultimaActividad: string
  }
  fechaRegistro: string
  fechaUltimoAcceso?: string
  dispositivos?: Array<{
    id: string
    nombre: string
    plataforma: string
    version: string
    ultimoAcceso: string
  }>
}

// Interfaz para logs de auditoría
export interface LogAuditoria {
  id: string
  accion: string
  usuario: string
  recurso?: string
  detalles: {
    [key: string]: any
  }
  datosAnteriores?: any
  datosNuevos?: any
  timestampAuditoria: string
  ip?: string
  userAgent?: string
  resultado: 'exitoso' | 'fallido'
  errorMessage?: string
}

// Interfaz para configuración del sistema
export interface ConfiguracionSistema {
  version: string
  fechaInicializacion: string
  adminPrincipal: string
  configuraciones: {
    maxUsuarios: number
    retencionLogs: number
    backupAutomatico: boolean
    notificacionesEmail: boolean
    mantenimiento: boolean
  }
  limites: {
    maxRecibosPorUsuario: number
    maxTamañoArchivo: number
    maxArchivosRecibo: number
  }
  integraciones: {
    emailService: {
      habilitado: boolean
      proveedor: string
      configuracion: any
    }
    analytics: {
      habilitado: boolean
      trackingId?: string
    }
  }
}

// Tipos para formularios
export interface LoginForm {
  email: string
  password: string
}

export interface UserForm {
  email: string
  nombreCompleto: string
  telefono?: string
  rol: UserRole
  estado?: UserStatus
  departamento?: string
  notas?: string
  password?: string
  confirmarPassword?: string
}

// Tipos para filtros y búsquedas
export interface UserFilters {
  rol?: UserRole
  estado?: UserStatus
  departamento?: string
  fechaDesde?: string
  fechaHasta?: string
  busqueda?: string
}

export interface ReciboFilters {
  fechaInicio?: string
  fechaFin?: string
  idVendedor?: number
  tipoPago?: string
  estado?: string
  numeroRecibo?: string
  clienteNombre?: string
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Tipos para métricas del dashboard
export interface DashboardMetrics {
  totalUsuarios: number
  usuariosActivos: number
  totalRecibos: number
  recibosHoy: number
  montoTotalRecibos: number
  montoRecibosHoy: number
  crecimientoUsuarios: number
  crecimientoRecibos: number
}

// Tipos para gráficos
export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string
    borderWidth?: number
  }>
}

// Tipos para notificaciones
export interface Notification {
  id: string
  tipo: 'info' | 'success' | 'warning' | 'error'
  titulo: string
  mensaje: string
  timestamp: string
  leida: boolean
  accion?: {
    texto: string
    url: string
  }
}

// Tipos para Administradores
export interface Administrador {
  id: string
  email: string
  password_hash: string
  nombre_completo: string
  rol: 'super_admin' | 'admin' | 'auditor'
  activo: boolean
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
  ultimo_acceso: FirebaseTimestamp | null
}

export interface AdministradorInput {
  email: string
  password_hash: string
  nombre_completo: string
  rol?: 'super_admin' | 'admin' | 'auditor'
  activo?: boolean
}

export interface ReciboDigitalInput {
  usuario_id: string
  plantilla_id?: string | null
  numero_recibo: string
  monto_total: number
  moneda?: string
  estado?: 'activo' | 'cancelado' | 'pendiente'
  datos_recibo: Json
  hash_verificacion: string
  fecha_emision?: FirebaseTimestamp
}

// Tipos para Detalles de Recibo
export interface DetalleRecibo {
  id: string
  recibo_id: string
  concepto: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  metadatos: Json | null
}

export interface DetalleReciboInput {
  recibo_id: string
  concepto: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  metadatos?: Json | null
}

// Tipos para Plantillas de Recibo
export interface PlantillaRecibo {
  id: string
  nombre: string
  descripcion: string | null
  estructura_campos: Json
  estilos_css: Json | null
  activa: boolean
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
}

export interface PlantillaReciboInput {
  nombre: string
  descripcion?: string | null
  estructura_campos: Json
  estilos_css?: Json | null
  activa?: boolean
}

// Tipos para Logs de Auditoría
export interface LogAuditoria {
  id: string      
  admin_id: string | null
  recibo_id: string | null
  accion: string
  datos_anteriores: Json | null
  datos_nuevos: Json | null
  ip_address: string | null
  user_agent: string | null
  timestamp: FirebaseTimestamp
}

export interface LogAuditoriaInput {
  admin_id?: string | null
  recibo_id?: string | null
  accion: string
  datos_anteriores?: Json | null
  datos_nuevos?: Json | null
  ip_address?: string | null
  user_agent?: string | null
}

// Tipos para Reportes
export interface ReporteRecibos {
  total_recibos: number
  ingresos_totales: number
  usuarios_activos: number
  tendencias: Json
}

export interface ReporteParams {
  tipo_reporte: string
  fecha_inicio: string
  fecha_fin: string
  formato?: string
}

// Nombres de colecciones de Firebase
export const COLLECTIONS = {
  ADMINISTRADORES: 'administradores',
  USUARIOS_APP: 'usuarios_app',
  RECIBOS_DIGITALES: 'recibos_digitales',
  DETALLES_RECIBO: 'detalles_recibo',
  PLANTILLAS_RECIBO: 'plantillas_recibo',
  LOGS_AUDITORIA: 'logs_auditoria'
} as const

// Tipos de utilidad para Firebase
export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS]

// Helper para convertir Timestamp de Firebase a Date
export const timestampToDate = (timestamp: FirebaseTimestamp): Date => {
  if (timestamp instanceof Date) {
    return timestamp
  }
  return timestamp.toDate()
}

// Helper para crear Timestamp de Firebase
export const dateToTimestamp = (date: Date = new Date()): Timestamp => {
  return Timestamp.fromDate(date)
}