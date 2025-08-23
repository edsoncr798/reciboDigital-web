<template>
  <div class="dashboard-page">
    <!-- Header del Dashboard -->
    <div class="dashboard-header mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 mb-2">Dashboard Principal</h1>
          <p class="text-gray-600">Resumen general del sistema de recibos digitales</p>
        </div>
        <div class="flex items-center space-x-3">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="a"
            start-placeholder="Fecha inicio"
            end-placeholder="Fecha fin"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
            @change="handleDateRangeChange"
            class="w-64"
          />
          <el-button type="primary" :icon="Refresh" @click="refreshData" :loading="loading">
            Actualizar
          </el-button>
        </div>
      </div>
    </div>

    <!-- Tarjetas de métricas principales -->
    <div class="metrics-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Total Recibos"
        :value="metrics.totalRecibos"
        :change="metrics.cambioRecibos"
        icon="Document"
        color="blue"
        :loading="loading || recibosLoading"
      />
      <MetricCard
        title="Ingresos Totales"
        :value="formatCurrency(metrics.ingresosTotales)"
        :change="metrics.cambioIngresos"
        icon="Money"
        color="green"
        :loading="loading || recibosLoading"
      />
      <MetricCard
        title="Saldo Pendiente"
        :value="formatCurrency(metrics.saldoPendiente)"
        :change="metrics.cambioSaldo"
        icon="User"
        color="orange"
        :loading="loading || recibosLoading"
      />
      <MetricCard
        title="Recibos Cancelados"
        :value="metrics.recibosCancelados"
        :change="metrics.cambioTasa"
        icon="TrendCharts"
        color="green"
        :loading="loading || recibosLoading"
      />
    </div>

    <!-- Gráficos principales -->
    <div class="charts-section grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Gráfico de tendencias -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">Tendencia de Recibos</h3>
            <el-select v-model="chartPeriod" @change="updateChartData" class="w-32">
              <el-option label="7 días" value="7d" />
              <el-option label="30 días" value="30d" />
              <el-option label="90 días" value="90d" />
            </el-select>
          </div>
        </template>
        <div class="chart-container h-80">
            <Line :data="lineChartData" :options="lineChartOptions" v-if="!loading && !recibosLoading && recibos.length > 0" />
            <div v-else-if="loading || recibosLoading" class="flex items-center justify-center h-full">
              <el-icon class="animate-spin text-2xl text-blue-500"><Loading /></el-icon>
            </div>
            <div v-else class="flex items-center justify-center h-full text-gray-500">
              <div class="text-center">
                <el-icon class="text-4xl mb-2"><Document /></el-icon>
                <p>No hay datos disponibles</p>
              </div>
            </div>
          </div>
      </el-card>

      <!-- Gráfico de distribución -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <h3 class="text-lg font-semibold text-gray-800">Distribución por Estado</h3>
        </template>
        <div class="chart-container h-80">
          <Doughnut :data="doughnutChartData" :options="doughnutChartOptions" v-if="!loading && !recibosLoading && recibos.length > 0" />
          <div v-else-if="loading || recibosLoading" class="flex items-center justify-center h-full">
            <el-icon class="animate-spin text-2xl text-blue-500"><Loading /></el-icon>
          </div>
          <div v-else class="flex items-center justify-center h-full text-gray-500">
            <div class="text-center">
              <el-icon class="text-4xl mb-2"><Document /></el-icon>
              <p>No hay datos disponibles</p>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Actividad reciente y alertas -->
    <div class="bottom-section grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Actividad reciente -->
      <div class="lg:col-span-2">
        <el-card class="activity-card" shadow="hover">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-800">Actividad Reciente</h3>
              <el-button type="text" @click="$router.push('/auditoria')">
                Ver todo
                <el-icon class="ml-1"><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="activity-list">
            <div 
              v-for="activity in recentActivity" 
              :key="activity.id"
              class="activity-item flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0"
            >
              <div class="activity-icon">
                <el-icon 
                  :class="getActivityIconClass(activity.type)"
                  class="text-xl"
                >
                  <component :is="getActivityIcon(activity.type)" />
                </el-icon>
              </div>
              <div class="activity-content flex-1">
                <p class="text-sm font-medium text-gray-800">{{ activity.description }}</p>
                <p class="text-xs text-gray-500">{{ formatRelativeTime(activity.timestamp) }}</p>
              </div>
              <div class="activity-meta">
                <el-tag :type="getActivityTagType(activity.type)" size="small">
                  {{ activity.type }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- Panel de alertas -->
      <div>
        <el-card class="alerts-card" shadow="hover">
          <template #header>
            <h3 class="text-lg font-semibold text-gray-800">Alertas del Sistema</h3>
          </template>
          <div class="alerts-list space-y-3">
            <div 
              v-for="alert in systemAlerts" 
              :key="alert.id"
              class="alert-item p-3 rounded-lg border-l-4"
              :class="getAlertClass(alert.level)"
            >
              <div class="flex items-start space-x-2">
                <el-icon :class="getAlertIconClass(alert.level)">
                  <component :is="getAlertIcon(alert.level)" />
                </el-icon>
                <div class="flex-1">
                  <p class="text-sm font-medium" :class="getAlertTextClass(alert.level)">
                    {{ alert.title }}
                  </p>
                  <p class="text-xs text-gray-600 mt-1">{{ alert.message }}</p>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRecibos } from '@/composables/useRecibos'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js'
import { Line, Doughnut } from 'vue-chartjs'
import MetricCard from '@/components/MetricCard.vue'
import { 
  Refresh, 
  Loading, 
  ArrowRight,
  Document,
  User,
  Money,
  Warning,
  SuccessFilled,
  InfoFilled
} from '@element-plus/icons-vue'
import type { ReciboDigital } from '@/lib/database.types'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const auth = useAuth()
const { obtenerRecibos, obtenerEstadisticas, loading: recibosLoading } = useRecibos()

// Estado reactivo
const loading = ref(false)
const dateRange = ref<[string, string]>(['2024-01-01', '2024-12-31'])
const chartPeriod = ref('30d')
const recibos = ref<ReciboDigital[]>([])
const estadisticas = ref<any>(null)

// Métricas principales calculadas desde datos reales
const metrics = computed(() => {
  if (recibos.value.length === 0) {
    return {
      totalRecibos: 0,
      cambioRecibos: 0,
      ingresosTotales: 0,
      cambioIngresos: 0,
      recibosCancelados: 0,
      cambioTasa: 0,
      saldoPendiente: 0,
      cambioSaldo: 0
    }
  }

  const totalRecibos = recibos.value.length
  const ingresosTotales = recibos.value.reduce((sum, recibo) => {
    return sum + (parseFloat(recibo.MontoPagado?.toString() || '0') || 0)
  }, 0)
  const saldoPendiente = recibos.value.reduce((sum, recibo) => {
    return sum + (parseFloat(recibo.SaldoPendiente?.toString() || '0') || 0)
  }, 0)
  const recibosCancelados = recibos.value.filter(r => r.EstadoPago === 'Cancelado').length
  const recibosActivos = recibos.value.filter(r => r.Estado === 'procesado').length
  
  return {
    totalRecibos,
    cambioRecibos: 0, // Se calcularía comparando con período anterior
    ingresosTotales,
    cambioIngresos: 0,
    recibosCancelados,
    cambioTasa: Math.round((recibosCancelados / totalRecibos) * 100),
    saldoPendiente,
    cambioSaldo: 0
  }
})

// Datos para gráfico de líneas basados en datos reales
const lineChartData = computed(() => {
  if (recibos.value.length === 0) {
    return {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Recibos Generados',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    }
  }

  // Agrupar recibos por mes
  const monthlyData = recibos.value.reduce((acc, recibo) => {
    try {
      const date = new Date(recibo.FechaGeneracion)
      if (isNaN(date.getTime())) return acc
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!acc[monthKey]) {
        acc[monthKey] = { count: 0, amount: 0 }
      }
      
      acc[monthKey].count++
      const monto = parseFloat(recibo.MontoPagado?.toString() || '0') || 0
      acc[monthKey].amount += monto
      
      return acc
    } catch (error) {
      console.warn('Error procesando fecha del recibo:', recibo.FechaGeneracion)
      return acc
    }
  }, {} as Record<string, { count: number; amount: number }>)

  const sortedMonths = Object.keys(monthlyData).sort()
  const labels = sortedMonths.map(month => {
    const [year, monthNum] = month.split('-')
    const date = new Date(parseInt(year), parseInt(monthNum) - 1)
    return date.toLocaleDateString('es-PE', { month: 'short', year: '2-digit' })
  })
  
  const recibosData = sortedMonths.map(month => monthlyData[month].count)
  const ingresosData = sortedMonths.map(month => Math.round(monthlyData[month].amount / 1000))

  return {
    labels,
    datasets: [
      {
        label: 'Recibos Generados',
        data: recibosData,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Ingresos (Miles PEN)',
        data: ingresosData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }
})

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}

// Datos para gráfico de dona basados en estados reales
const doughnutChartData = computed(() => {
  if (recibos.value.length === 0) {
    return {
      labels: ['Sin datos'],
      datasets: [
        {
          data: [1],
          backgroundColor: ['#e5e7eb'],
          borderWidth: 0
        }
      ]
    }
  }

  const estadosCounts = recibos.value.reduce((acc, recibo) => {
    const estado = recibo.EstadoPago || 'Sin Estado'
    acc[estado] = (acc[estado] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const labels = Object.keys(estadosCounts)
  const data = Object.values(estadosCounts)
  const colors = {
    'Cancelado': '#10b981',
    'Parcial': '#f59e0b', 
    'Pendiente': '#ef4444',
    'Sin Estado': '#6b7280'
  }

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: labels.map(label => colors[label as keyof typeof colors] || '#6b7280'),
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  }
})

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    }
  }
}

// Actividad reciente se calcula dinámicamente más abajo

// Alertas del sistema
const systemAlerts = ref([
  {
    id: 1,
    level: 'warning',
    title: 'Espacio en disco',
    message: 'El almacenamiento está al 85% de capacidad'
  },
  {
    id: 2,
    level: 'info',
    title: 'Actualización disponible',
    message: 'Nueva versión del sistema disponible'
  },
  {
    id: 3,
    level: 'success',
    title: 'Backup completado',
    message: 'Respaldo de datos realizado exitosamente'
  }
])

// Métodos
const refreshData = async () => {
  loading.value = true
  try {
    // Cargar recibos con filtros de fecha
    const filtros = {
      fechaInicio: dateRange.value[0],
      fechaFin: dateRange.value[1]
    }
    
    console.log('Cargando datos del dashboard con filtros:', filtros)
    
    const recibosResult = await obtenerRecibos(filtros)
    
    if (recibosResult.success && recibosResult.data) {
      recibos.value = recibosResult.data
      console.log('Recibos cargados:', recibos.value.length)
    } else {
      console.warn('No se pudieron cargar los recibos:', recibosResult)
      recibos.value = []
    }
    
    // Intentar cargar estadísticas si está disponible
    try {
      const estadisticasResult = await obtenerEstadisticas(filtros)
      if (estadisticasResult.success) {
        estadisticas.value = estadisticasResult.data
      }
    } catch (statsError) {
      console.warn('Estadísticas no disponibles:', statsError)
      estadisticas.value = null
    }
    
  } catch (error) {
    console.error('Error cargando datos del dashboard:', error)
    recibos.value = []
    estadisticas.value = null
  } finally {
    loading.value = false
  }
}

const handleDateRangeChange = (dates: [string, string] | null) => {
  if (dates) {
    // Actualizar datos basado en el rango de fechas
    refreshData()
  }
}

const updateChartData = () => {
  // Actualizar datos del gráfico basado en el período seleccionado
  refreshData()
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(amount)
}

const formatRelativeTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'Hace un momento'
  if (minutes < 60) return `Hace ${minutes} minutos`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} horas`
  
  const days = Math.floor(hours / 24)
  return `Hace ${days} días`
}

// Helpers para actividades
const getActivityIcon = (type: string) => {
  const icons: Record<string, any> = {
    'Recibo': Document,
    'Usuario': User,
    'Sistema': InfoFilled
  }
  return icons[type] || InfoFilled
}

const getActivityIconClass = (type: string) => {
  const classes: Record<string, string> = {
    'Recibo': 'text-blue-500',
    'Usuario': 'text-green-500',
    'Sistema': 'text-gray-500'
  }
  return classes[type] || 'text-gray-500'
}

const getActivityTagType = (type: string) => {
  const types: Record<string, string> = {
    'Recibo': 'primary',
    'Usuario': 'success',
    'Sistema': 'info'
  }
  return types[type] || 'info'
}

// Helpers para alertas
const getAlertIcon = (level: string) => {
  const icons: Record<string, any> = {
    'warning': Warning,
    'success': SuccessFilled,
    'info': InfoFilled
  }
  return icons[level] || InfoFilled
}

const getAlertClass = (level: string) => {
  const classes: Record<string, string> = {
    'warning': 'bg-yellow-50 border-yellow-400',
    'success': 'bg-green-50 border-green-400',
    'info': 'bg-blue-50 border-blue-400'
  }
  return classes[level] || 'bg-gray-50 border-gray-400'
}

const getAlertIconClass = (level: string) => {
  const classes: Record<string, string> = {
    'warning': 'text-yellow-500',
    'success': 'text-green-500',
    'info': 'text-blue-500'
  }
  return classes[level] || 'text-gray-500'
}

const getAlertTextClass = (level: string) => {
  const classes: Record<string, string> = {
    'warning': 'text-yellow-800',
    'success': 'text-green-800',
    'info': 'text-blue-800'
  }
  return classes[level] || 'text-gray-800'
}

onMounted(async () => {
  console.log('Dashboard montado, cargando datos iniciales...')
  await refreshData()
})

// Actualizar actividad reciente con datos reales
const recentActivity = computed(() => {
  if (recibos.value.length === 0) {
    return [
      {
        id: 1,
        type: 'Sistema',
        description: 'No hay actividad reciente disponible',
        timestamp: new Date()
      }
    ]
  }
  
  return recibos.value
    .sort((a, b) => new Date(b.FechaGeneracion).getTime() - new Date(a.FechaGeneracion).getTime())
    .slice(0, 5)
    .map((recibo, index) => {
      const monto = parseFloat(recibo.MontoPagado?.toString() || '0') || 0
      return {
        id: recibo.ReciboId || index + 1,
        type: 'Recibo',
        description: `${recibo.NumeroRecibo} - ${recibo.ClienteNombre} - ${formatCurrency(monto)} (${recibo.EstadoPago})`,
        timestamp: new Date(recibo.FechaGeneracion)
      }
    })
})
</script>

<style scoped>
.dashboard-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.chart-card {
  transition: all 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-2px);
}

.activity-item {
  transition: all 0.2s ease;
}

.activity-item:hover {
  background-color: #f9fafb;
}

.alert-item {
  transition: all 0.2s ease;
}

.alert-item:hover {
  transform: translateX(2px);
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

.metrics-grid > * {
  animation: fadeInUp 0.6s ease-out;
}

.charts-section > * {
  animation: fadeInUp 0.8s ease-out;
}

.bottom-section > * {
  animation: fadeInUp 1s ease-out;
}
</style>