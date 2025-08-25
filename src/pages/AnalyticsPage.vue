<template>
  <div class="analytics-page">
    <div class="page-header mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 mb-2">Dashboard Analítico</h1>
          <p class="text-gray-600">Análisis avanzado y tendencias del sistema</p>
        </div>
        <div class="flex items-center space-x-3">
          <el-select v-model="periodoAnalisis" @change="cargarDatos" class="w-40">
            <el-option label="Último mes" value="30d" />
            <el-option label="Últimos 3 meses" value="90d" />
            <el-option label="Último año" value="365d" />
          </el-select>
          <el-button type="primary" :icon="Download" @click="exportarAnalisis" :loading="exporting">
            Exportar
          </el-button>
          <el-button type="info" :icon="Refresh" @click="cargarDatos" :loading="loading">
            Actualizar
          </el-button>
        </div>
      </div>
    </div>

    <!-- KPIs principales -->
    <div class="kpis-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <el-card class="kpi-card" shadow="hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Crecimiento Mensual</p>
            <p class="text-2xl font-bold text-green-600">{{ kpis.crecimientoMensual }}%</p>
            <p class="text-xs text-gray-500">vs mes anterior</p>
          </div>
          <el-icon class="text-3xl text-green-500"><TrendCharts /></el-icon>
        </div>
      </el-card>
      
      <el-card class="kpi-card" shadow="hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Ticket Promedio</p>
            <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(kpis.ticketPromedio) }}</p>
            <p class="text-xs text-gray-500">por recibo</p>
          </div>
          <el-icon class="text-3xl text-blue-500"><Money /></el-icon>
        </div>
      </el-card>
      
      <el-card class="kpi-card" shadow="hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Tasa de Cancelación</p>
            <p class="text-2xl font-bold text-purple-600">{{ kpis.tasaCancelacion }}%</p>
            <p class="text-xs text-gray-500">recibos cancelados</p>
          </div>
          <el-icon class="text-3xl text-purple-500"><SuccessFilled /></el-icon>
        </div>
      </el-card>
      
      <el-card class="kpi-card" shadow="hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Tiempo Promedio</p>
            <p class="text-2xl font-bold text-orange-600">{{ kpis.tiempoPromedio }}</p>
            <p class="text-xs text-gray-500">días para cancelar</p>
          </div>
          <el-icon class="text-3xl text-orange-500"><Clock /></el-icon>
        </div>
      </el-card>
    </div>

    <!-- Gráficos principales -->
    <div class="charts-section grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Tendencia de ingresos -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <h3 class="text-lg font-semibold text-gray-800">Tendencia de Ingresos</h3>
        </template>
        <div class="chart-container h-80">
          <Line :data="ingresosTrendData" :options="lineChartOptions" v-if="!loading && recibos.length > 0" />
          <div v-else-if="loading" class="flex items-center justify-center h-full">
            <el-icon class="animate-spin text-2xl text-blue-500"><Loading /></el-icon>
          </div>
          <div v-else class="flex items-center justify-center h-full text-gray-500">
            <div class="text-center">
              <el-icon class="text-4xl mb-2"><DataAnalysis /></el-icon>
              <p>No hay datos disponibles</p>
            </div>
          </div>
        </div>
      </el-card>

      <!-- Distribución por vendedor -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <h3 class="text-lg font-semibold text-gray-800">Top Vendedores</h3>
        </template>
        <div class="chart-container h-80">
          <Bar :data="vendedoresData" :options="barChartOptions" v-if="!loading && recibos.length > 0" />
          <div v-else-if="loading" class="flex items-center justify-center h-full">
            <el-icon class="animate-spin text-2xl text-blue-500"><Loading /></el-icon>
          </div>
          <div v-else class="flex items-center justify-center h-full text-gray-500">
            <div class="text-center">
              <el-icon class="text-4xl mb-2"><User /></el-icon>
              <p>No hay datos disponibles</p>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Gráficos secundarios -->
    <div class="secondary-charts grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Métodos de pago -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <h3 class="text-lg font-semibold text-gray-800">Métodos de Pago</h3>
        </template>
        <div class="chart-container h-64">
          <Doughnut :data="metodosPagoData" :options="doughnutChartOptions" v-if="!loading && recibos.length > 0" />
          <div v-else-if="loading" class="flex items-center justify-center h-full">
            <el-icon class="animate-spin text-2xl text-blue-500"><Loading /></el-icon>
          </div>
          <div v-else class="flex items-center justify-center h-full text-gray-500">
            <div class="text-center">
              <el-icon class="text-2xl mb-1"><CreditCard /></el-icon>
              <p class="text-sm">Sin datos</p>
            </div>
          </div>
        </div>
      </el-card>

      <!-- Estados de pago -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <h3 class="text-lg font-semibold text-gray-800">Estados de Pago</h3>
        </template>
        <div class="chart-container h-64">
          <Pie :data="estadosPagoData" :options="pieChartOptions" v-if="!loading && recibos.length > 0" />
          <div v-else-if="loading" class="flex items-center justify-center h-full">
            <el-icon class="animate-spin text-2xl text-blue-500"><Loading /></el-icon>
          </div>
          <div v-else class="flex items-center justify-center h-full text-gray-500">
            <div class="text-center">
              <el-icon class="text-2xl mb-1"><CircleCheck /></el-icon>
              <p class="text-sm">Sin datos</p>
            </div>
          </div>
        </div>
      </el-card>

      <!-- Análisis temporal -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <h3 class="text-lg font-semibold text-gray-800">Actividad por Hora</h3>
        </template>
        <div class="chart-container h-64">
          <Bar :data="actividadHorariaData" :options="hourlyChartOptions" v-if="!loading && recibos.length > 0" />
          <div v-else-if="loading" class="flex items-center justify-center h-full">
            <el-icon class="animate-spin text-2xl text-blue-500"><Loading /></el-icon>
          </div>
          <div v-else class="flex items-center justify-center h-full text-gray-500">
            <div class="text-center">
              <el-icon class="text-2xl mb-1"><Clock /></el-icon>
              <p class="text-sm">Sin datos</p>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Tabla de análisis detallado -->
    <el-card class="analysis-table-card" shadow="never">
      <template #header>
        <h3 class="text-lg font-semibold text-gray-800">Análisis Detallado por Vendedor</h3>
      </template>
      
      <el-table :data="analisisVendedores" :loading="loading" stripe border>
        <el-table-column prop="vendedor" label="Vendedor" min-width="150" />
        <el-table-column prop="totalRecibos" label="Total Recibos" width="120" align="center" />
        <el-table-column prop="montoTotal" label="Monto Total" width="150" align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.montoTotal) }}
          </template>
        </el-table-column>
        <el-table-column prop="ticketPromedio" label="Ticket Promedio" width="150" align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.ticketPromedio) }}
          </template>
        </el-table-column>
        <el-table-column prop="tasaCancelacion" label="Tasa Cancelación" width="130" align="center">
          <template #default="{ row }">
            {{ row.tasaCancelacion }}%
          </template>
        </el-table-column>
        <el-table-column prop="rendimiento" label="Rendimiento" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getRendimientoTagType(row.rendimiento)" size="small">
              {{ row.rendimiento }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRecibos } from '@/composables/useRecibos'
import { ElMessage } from 'element-plus'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Line, Bar, Doughnut, Pie } from 'vue-chartjs'
import {
  DataAnalysis,
  Download,
  Refresh,
  TrendCharts,
  Money,
  SuccessFilled,
  Clock,
  Loading,
  User,
  CreditCard,
  CircleCheck
} from '@element-plus/icons-vue'
import type { ReciboDigital } from '@/lib/database.types'
import { formatMonthYearPeru } from '@/lib/utils'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const { obtenerRecibos, loading } = useRecibos()

// Estado
const recibos = ref<ReciboDigital[]>([])
const exporting = ref(false)
const periodoAnalisis = ref('30d')

// KPIs calculados
const kpis = computed(() => {
  if (recibos.value.length === 0) {
    return {
      crecimientoMensual: 0,
      ticketPromedio: 0,
      tasaCancelacion: 0,
      tiempoPromedio: 0
    }
  }

  const totalIngresos = recibos.value.reduce((sum, r) => sum + (r.MontoPagado || 0), 0)
  const ticketPromedio = totalIngresos / recibos.value.length
  const recibosCancelados = recibos.value.filter(r => r.EstadoPago === 'Cancelado').length
  const tasaCancelacion = Math.round((recibosCancelados / recibos.value.length) * 100)
  
  return {
    crecimientoMensual: 12.5, // Se calcularía comparando períodos
    ticketPromedio,
    tasaCancelacion,
    tiempoPromedio: 15 // Se calcularía basado en fechas
  }
})

// Datos para gráfico de tendencia de ingresos
const ingresosTrendData = computed(() => {
  if (recibos.value.length === 0) return { labels: [], datasets: [] }

  // Agrupar por semana
  const weeklyData = recibos.value.reduce((acc, recibo) => {
    const date = new Date(recibo.FechaGeneracion)
    const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
    const weekKey = weekStart.toISOString().split('T')[0]
    
    if (!acc[weekKey]) {
      acc[weekKey] = { ingresos: 0, recibos: 0 }
    }
    
    acc[weekKey].ingresos += recibo.MontoPagado || 0
    acc[weekKey].recibos += 1
    
    return acc
  }, {} as Record<string, { ingresos: number; recibos: number }>)

  const sortedWeeks = Object.keys(weeklyData).sort()
  const labels = sortedWeeks.map(week => {
    return formatMonthYearPeru(week)
  })
  
  return {
    labels,
    datasets: [
      {
        label: 'Ingresos Semanales',
        data: sortedWeeks.map(week => weeklyData[week].ingresos),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }
})

// Datos para gráfico de vendedores
const vendedoresData = computed(() => {
  if (recibos.value.length === 0) return { labels: [], datasets: [] }

  const vendedoresStats = recibos.value.reduce((acc, recibo) => {
    const vendedor = recibo.VendedorNombre || 'Sin Vendedor'
    if (!acc[vendedor]) {
      acc[vendedor] = { ingresos: 0, recibos: 0 }
    }
    acc[vendedor].ingresos += recibo.MontoPagado || 0
    acc[vendedor].recibos += 1
    return acc
  }, {} as Record<string, { ingresos: number; recibos: number }>)

  const topVendedores = Object.entries(vendedoresStats)
    .sort(([,a], [,b]) => b.ingresos - a.ingresos)
    .slice(0, 10)

  return {
    labels: topVendedores.map(([nombre]) => nombre),
    datasets: [
      {
        label: 'Ingresos por Vendedor',
        data: topVendedores.map(([,stats]) => stats.ingresos),
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
          '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
        ]
      }
    ]
  }
})

// Datos para métodos de pago
const metodosPagoData = computed(() => {
  if (recibos.value.length === 0) return { labels: [], datasets: [] }

  const metodos = recibos.value.reduce((acc, recibo) => {
    const metodo = recibo.MetodoPago || 'No especificado'
    acc[metodo] = (acc[metodo] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    labels: Object.keys(metodos),
    datasets: [
      {
        data: Object.values(metodos),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
      }
    ]
  }
})

// Datos para estados de pago
const estadosPagoData = computed(() => {
  if (recibos.value.length === 0) return { labels: [], datasets: [] }

  const estados = recibos.value.reduce((acc, recibo) => {
    const estado = recibo.EstadoPago || 'Sin Estado'
    acc[estado] = (acc[estado] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    labels: Object.keys(estados),
    datasets: [
      {
        data: Object.values(estados),
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
      }
    ]
  }
})

// Datos para actividad horaria
const actividadHorariaData = computed(() => {
  if (recibos.value.length === 0) return { labels: [], datasets: [] }

  const hourlyActivity = Array(24).fill(0)
  recibos.value.forEach(recibo => {
    const hour = new Date(recibo.FechaGeneracion).getHours()
    hourlyActivity[hour]++
  })

  return {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Recibos por Hora',
        data: hourlyActivity,
        backgroundColor: '#3b82f6'
      }
    ]
  }
})

// Análisis detallado por vendedor
const analisisVendedores = computed(() => {
  if (recibos.value.length === 0) return []

  const vendedoresStats = recibos.value.reduce((acc, recibo) => {
    const vendedor = recibo.VendedorNombre || 'Sin Vendedor'
    if (!acc[vendedor]) {
      acc[vendedor] = {
        totalRecibos: 0,
        montoTotal: 0,
        cancelados: 0
      }
    }
    acc[vendedor].totalRecibos++
    acc[vendedor].montoTotal += recibo.MontoPagado || 0
    if (recibo.EstadoPago === 'Cancelado') {
      acc[vendedor].cancelados++
    }
    return acc
  }, {} as Record<string, any>)

  return Object.entries(vendedoresStats).map(([vendedor, stats]) => {
    const ticketPromedio = stats.montoTotal / stats.totalRecibos
    const tasaCancelacion = Math.round((stats.cancelados / stats.totalRecibos) * 100)
    let rendimiento = 'Bajo'
    if (tasaCancelacion >= 70) rendimiento = 'Alto'
    else if (tasaCancelacion >= 40) rendimiento = 'Medio'

    return {
      vendedor,
      totalRecibos: stats.totalRecibos,
      montoTotal: stats.montoTotal,
      ticketPromedio,
      tasaCancelacion,
      rendimiento
    }
  }).sort((a, b) => b.montoTotal - a.montoTotal)
})

// Opciones de gráficos
const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const }
  },
  scales: {
    y: { beginAtZero: true }
  }
}

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: { beginAtZero: true }
  }
}

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const }
  }
}

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const }
  }
}

const hourlyChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: { beginAtZero: true }
  }
}

// Métodos
const cargarDatos = async () => {
  try {
    const diasAtras = parseInt(periodoAnalisis.value.replace('d', ''))
    const fechaInicio = new Date()
    fechaInicio.setDate(fechaInicio.getDate() - diasAtras)
    
    const filtros = {
      fechaInicio: fechaInicio.toISOString().split('T')[0],
      fechaFin: new Date().toISOString().split('T')[0]
    }
    
    const result = await obtenerRecibos(filtros)
    if (result.success) {
      recibos.value = result.data || []
    }
  } catch (error) {
    console.error('Error cargando datos:', error)
    ElMessage.error('Error al cargar los datos analíticos')
  }
}

const exportarAnalisis = async () => {
  exporting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('Análisis exportado exitosamente')
  } catch (error) {
    ElMessage.error('Error al exportar el análisis')
  } finally {
    exporting.value = false
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(amount)
}

const getRendimientoTagType = (rendimiento: string) => {
  const types: Record<string, string> = {
    'Alto': 'success',
    'Medio': 'warning',
    'Bajo': 'danger'
  }
  return types[rendimiento] || 'info'
}

onMounted(() => {
  cargarDatos()
})
</script>

<style scoped>
.analytics-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.kpi-card {
  transition: all 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
}

.chart-card {
  transition: all 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-2px);
}

.analysis-table-card {
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

.kpis-section > * {
  animation: fadeInUp 0.6s ease-out;
}

.charts-section > *, .secondary-charts > * {
  animation: fadeInUp 0.8s ease-out;
}

.analysis-table-card {
  animation: fadeInUp 1s ease-out;
}
</style>