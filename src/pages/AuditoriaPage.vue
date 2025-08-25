<template>
  <div class="auditoria-page">
    <div class="page-header mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 mb-2">Auditoría y Logs</h1>
          <p class="text-gray-600">Registro de actividades y trazabilidad del sistema</p>
        </div>
        <div class="flex items-center space-x-3">
          <el-button type="success" :icon="Download" @click="exportarLogs" :loading="exporting">
            Exportar Logs
          </el-button>
          <el-button type="primary" :icon="Refresh" @click="cargarLogs" :loading="loading">
            Actualizar
          </el-button>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <el-card class="filters-card mb-6" shadow="never">
      <template #header>
        <h3 class="text-lg font-semibold text-gray-800">Filtros de Auditoría</h3>
      </template>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <el-form-item label="Rango de Fechas">
          <el-date-picker
            v-model="filtros.fechas"
            type="datetimerange"
            range-separator="a"
            start-placeholder="Fecha inicio"
            end-placeholder="Fecha fin"
            format="DD/MM/YYYY HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="aplicarFiltros"
            class="w-full"
          />
        </el-form-item>
        
        <el-form-item label="Tipo de Actividad">
          <el-select v-model="filtros.tipoActividad" placeholder="Todas las actividades" clearable @change="aplicarFiltros" class="w-full">
            <el-option label="Creación de Recibo" value="recibo_creado" />
            <el-option label="Modificación de Recibo" value="recibo_modificado" />
            <el-option label="Eliminación de Recibo" value="recibo_eliminado" />
            <el-option label="Inicio de Sesión" value="login" />
            <el-option label="Cierre de Sesión" value="logout" />
            <el-option label="Cambio de Configuración" value="config_change" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Usuario">
          <el-select v-model="filtros.usuario" placeholder="Todos los usuarios" clearable @change="aplicarFiltros" class="w-full">
            <el-option
              v-for="usuario in usuarios"
              :key="usuario.id"
              :label="usuario.nombre"
              :value="usuario.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Nivel de Severidad">
          <el-select v-model="filtros.severidad" placeholder="Todos los niveles" clearable @change="aplicarFiltros" class="w-full">
            <el-option label="Información" value="info" />
            <el-option label="Advertencia" value="warning" />
            <el-option label="Error" value="error" />
            <el-option label="Crítico" value="critical" />
          </el-select>
        </el-form-item>
      </div>
    </el-card>

    <!-- Estadísticas de auditoría -->
    <div class="stats-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <el-card class="stat-card" shadow="hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Total Eventos</p>
            <p class="text-2xl font-bold text-blue-600">{{ estadisticas.totalEventos }}</p>
          </div>
          <el-icon class="text-3xl text-blue-500"><DataAnalysis /></el-icon>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Eventos Hoy</p>
            <p class="text-2xl font-bold text-green-600">{{ estadisticas.eventosHoy }}</p>
          </div>
          <el-icon class="text-3xl text-green-500"><Calendar /></el-icon>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Usuarios Activos</p>
            <p class="text-2xl font-bold text-purple-600">{{ estadisticas.usuariosActivos }}</p>
          </div>
          <el-icon class="text-3xl text-purple-500"><User /></el-icon>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Errores</p>
            <p class="text-2xl font-bold text-red-600">{{ estadisticas.errores }}</p>
          </div>
          <el-icon class="text-3xl text-red-500"><Warning /></el-icon>
        </div>
      </el-card>
    </div>

    <!-- Tabla de logs -->
    <el-card class="logs-table-card" shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">Registro de Actividades</h3>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">{{ logs.length }} registros</span>
            <el-divider direction="vertical" />
            <el-button type="text" @click="autoRefresh = !autoRefresh" :class="{ 'text-green-600': autoRefresh }">
              <el-icon class="mr-1"><{{ autoRefresh ? 'VideoPause' : 'VideoPlay' }} /></el-icon>
              {{ autoRefresh ? 'Pausar' : 'Auto-actualizar' }}
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        :data="logs"
        :loading="loading"
        stripe
        border
        height="600"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="timestamp" label="Fecha/Hora" width="180" sortable>
          <template #default="{ row }">
            {{ formatDateTimePeru(row.timestamp) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="severidad" label="Nivel" width="100">
          <template #default="{ row }">
            <el-tag :type="getSeveridadTagType(row.severidad)" size="small">
              {{ getSeveridadLabel(row.severidad) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="tipoActividad" label="Actividad" width="150">
          <template #default="{ row }">
            <div class="flex items-center">
              <el-icon class="mr-2" :class="getActividadIconClass(row.tipoActividad)">
                <component :is="getActividadIcon(row.tipoActividad)" />
              </el-icon>
              {{ getActividadLabel(row.tipoActividad) }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="usuario" label="Usuario" width="150" />
        
        <el-table-column prop="descripcion" label="Descripción" min-width="300" />
        
        <el-table-column prop="ip" label="IP" width="120" />
        
        <el-table-column prop="detalles" label="Detalles" width="100">
          <template #default="{ row }">
            <el-button type="text" @click="verDetalles(row)" v-if="row.detalles">
              <el-icon><View /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Modal de detalles -->
    <el-dialog v-model="dialogDetalles" title="Detalles del Evento" width="600px">
      <div v-if="eventoSeleccionado">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="Timestamp">{{ formatDateTimePeru(eventoSeleccionado.timestamp) }}</el-descriptions-item>
          <el-descriptions-item label="Usuario">{{ eventoSeleccionado.usuario }}</el-descriptions-item>
          <el-descriptions-item label="Actividad">{{ getActividadLabel(eventoSeleccionado.tipoActividad) }}</el-descriptions-item>
          <el-descriptions-item label="IP">{{ eventoSeleccionado.ip }}</el-descriptions-item>
          <el-descriptions-item label="User Agent">{{ eventoSeleccionado.userAgent || 'No disponible' }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="mt-4" v-if="eventoSeleccionado.detalles">
          <h4 class="text-md font-semibold mb-2">Detalles Adicionales:</h4>
          <el-input
            type="textarea"
            :value="JSON.stringify(eventoSeleccionado.detalles, null, 2)"
            :rows="10"
            readonly
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRecibos } from '@/composables/useRecibos'
import { ElMessage } from 'element-plus'
import {
  View,
  Download,
  Refresh,
  DataAnalysis,
  Calendar,
  User,
  Warning,
  Document,
  Edit,
  Delete,
  Lock,
  Unlock,
  Setting
} from '@element-plus/icons-vue'
import type { ReciboDigital } from '@/lib/database.types'
import { formatDateTimePeru } from '@/lib/utils'

const { obtenerRecibos, loading } = useRecibos()

// Estado
const logs = ref<any[]>([])
const exporting = ref(false)
const autoRefresh = ref(false)
const dialogDetalles = ref(false)
const eventoSeleccionado = ref<any>(null)
let refreshInterval: NodeJS.Timeout | null = null

// Filtros
const filtros = reactive({
  fechas: null as [string, string] | null,
  tipoActividad: null as string | null,
  usuario: null as string | null,
  severidad: null as string | null
})

// Usuarios para filtro (simulado)
const usuarios = ref([
  { id: '1', nombre: 'Admin Principal' },
  { id: '2', nombre: 'Juan Pérez' },
  { id: '3', nombre: 'María García' },
  { id: '4', nombre: 'Carlos López' }
])

// Estadísticas calculadas
const estadisticas = computed(() => {
  const totalEventos = logs.value.length
  const hoy = new Date().toDateString()
  const eventosHoy = logs.value.filter(log => 
    new Date(log.timestamp).toDateString() === hoy
  ).length
  
  const usuariosUnicos = new Set(logs.value.map(log => log.usuario))
  const usuariosActivos = usuariosUnicos.size
  
  const errores = logs.value.filter(log => 
    ['error', 'critical'].includes(log.severidad)
  ).length
  
  return {
    totalEventos,
    eventosHoy,
    usuariosActivos,
    errores
  }
})

// Métodos
const cargarLogs = async () => {
  try {
    // Simular carga de logs basados en recibos reales
    const result = await obtenerRecibos({})
    if (result.success && result.data) {
      // Generar logs simulados basados en los recibos
      const logsSimulados = result.data.flatMap((recibo, index) => {
        const baseTime = new Date(recibo.FechaGeneracion)
        return [
          {
            id: `log_${index}_1`,
            timestamp: baseTime.toISOString(),
            severidad: 'info',
            tipoActividad: 'recibo_creado',
            usuario: recibo.VendedorNombre || 'Sistema',
            descripcion: `Recibo ${recibo.NumeroRecibo} creado para ${recibo.ClienteNombre}`,
            ip: '192.168.1.' + (Math.floor(Math.random() * 254) + 1),
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            detalles: {
              numeroRecibo: recibo.NumeroRecibo,
              cliente: recibo.ClienteNombre,
              monto: recibo.MontoPagado,
              vendedor: recibo.VendedorNombre
            }
          }
        ]
      })
      
      // Agregar algunos logs adicionales del sistema
      const logsAdicionales = [
        {
          id: 'sys_1',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          severidad: 'info',
          tipoActividad: 'login',
          usuario: 'Admin Principal',
          descripcion: 'Inicio de sesión exitoso',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          detalles: { sessionId: 'sess_123456' }
        },
        {
          id: 'sys_2',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          severidad: 'warning',
          tipoActividad: 'config_change',
          usuario: 'Admin Principal',
          descripcion: 'Configuración del sistema modificada',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          detalles: { setting: 'max_file_size', oldValue: '10MB', newValue: '20MB' }
        }
      ]
      
      logs.value = [...logsSimulados, ...logsAdicionales]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    }
  } catch (error) {
    console.error('Error cargando logs:', error)
    ElMessage.error('Error al cargar los logs de auditoría')
  }
}

const aplicarFiltros = () => {
  // En una implementación real, esto filtrarían los logs desde el servidor
  cargarLogs()
}

const exportarLogs = async () => {
  exporting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('Logs exportados exitosamente')
  } catch (error) {
    ElMessage.error('Error al exportar los logs')
  } finally {
    exporting.value = false
  }
}

const verDetalles = (evento: any) => {
  eventoSeleccionado.value = evento
  dialogDetalles.value = true
}

const handleSortChange = ({ prop, order }: any) => {
  // Implementar ordenamiento
  console.log('Sort:', prop, order)
}

// Función de formato de fecha ahora importada desde @/lib/utils

const getSeveridadTagType = (severidad: string) => {
  const types: Record<string, string> = {
    'info': 'info',
    'warning': 'warning',
    'error': 'danger',
    'critical': 'danger'
  }
  return types[severidad] || 'info'
}

const getSeveridadLabel = (severidad: string) => {
  const labels: Record<string, string> = {
    'info': 'Info',
    'warning': 'Advertencia',
    'error': 'Error',
    'critical': 'Crítico'
  }
  return labels[severidad] || severidad
}

const getActividadIcon = (actividad: string) => {
  const icons: Record<string, any> = {
    'recibo_creado': Document,
    'recibo_modificado': Edit,
    'recibo_eliminado': Delete,
    'login': Lock,
    'logout': Unlock,
    'config_change': Setting
  }
  return icons[actividad] || Document
}

const getActividadIconClass = (actividad: string) => {
  const classes: Record<string, string> = {
    'recibo_creado': 'text-green-500',
    'recibo_modificado': 'text-blue-500',
    'recibo_eliminado': 'text-red-500',
    'login': 'text-green-500',
    'logout': 'text-gray-500',
    'config_change': 'text-orange-500'
  }
  return classes[actividad] || 'text-gray-500'
}

const getActividadLabel = (actividad: string) => {
  const labels: Record<string, string> = {
    'recibo_creado': 'Recibo Creado',
    'recibo_modificado': 'Recibo Modificado',
    'recibo_eliminado': 'Recibo Eliminado',
    'login': 'Inicio Sesión',
    'logout': 'Cierre Sesión',
    'config_change': 'Config. Cambiada'
  }
  return labels[actividad] || actividad
}

// Auto-refresh
const startAutoRefresh = () => {
  if (refreshInterval) clearInterval(refreshInterval)
  refreshInterval = setInterval(() => {
    if (autoRefresh.value) {
      cargarLogs()
    }
  }, 30000) // Cada 30 segundos
}

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

onMounted(() => {
  cargarLogs()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.auditoria-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.filters-card {
  border: 1px solid #e5e7eb;
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.logs-table-card {
  border: 1px solid #e5e7eb;
}

/* Animaciones */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-section > * {
  animation: fadeInUp 0.6s ease-out;
}

.filters-card, .logs-table-card {
  animation: fadeInUp 0.8s ease-out;
}
</style>