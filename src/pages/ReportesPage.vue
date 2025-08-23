<template>
  <div class="reportes-page">
    <div class="page-header mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 mb-2">Reportes y Analytics</h1>
          <p class="text-gray-600">Genera reportes personalizados y analiza tendencias</p>
        </div>
        <div class="flex items-center space-x-3">
          <el-button type="success" :icon="Download" @click="exportarReporte" :loading="exporting">
            Exportar Excel
          </el-button>
          <el-button type="primary" :icon="Refresh" @click="cargarDatos" :loading="loading">
            Actualizar
          </el-button>
        </div>
      </div>
    </div>

    <!-- Filtros de reporte -->
    <el-card class="filters-card mb-6" shadow="never">
      <template #header>
        <h3 class="text-lg font-semibold text-gray-800">Filtros de Reporte</h3>
      </template>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <el-form-item label="Rango de Fechas">
          <el-date-picker
            v-model="filtros.fechas"
            type="daterange"
            range-separator="a"
            start-placeholder="Fecha inicio"
            end-placeholder="Fecha fin"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
            @change="aplicarFiltros"
            class="w-full"
          />
        </el-form-item>
        
        <el-form-item label="Vendedor">
          <el-select v-model="filtros.vendedor" placeholder="Todos los vendedores" clearable @change="aplicarFiltros" class="w-full">
            <el-option
              v-for="vendedor in vendedores"
              :key="vendedor.id"
              :label="vendedor.nombre"
              :value="vendedor.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Tipo de Pago">
          <el-select v-model="filtros.tipoPago" placeholder="Todos los tipos" clearable @change="aplicarFiltros" class="w-full">
            <el-option label="Cancelación" value="cancelacion" />
            <el-option label="Amortización" value="amortizacion" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Estado de Pago">
          <el-select v-model="filtros.estadoPago" placeholder="Todos los estados" clearable @change="aplicarFiltros" class="w-full">
            <el-option label="Cancelado" value="Cancelado" />
            <el-option label="Parcial" value="Parcial" />
            <el-option label="Pendiente" value="Pendiente" />
          </el-select>
        </el-form-item>
      </div>
    </el-card>

    <!-- Resumen ejecutivo -->
    <div class="summary-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <el-card class="summary-card" shadow="hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Total Recibos</p>
            <p class="text-2xl font-bold text-blue-600">{{ resumen.totalRecibos }}</p>
          </div>
          <el-icon class="text-3xl text-blue-500"><Document /></el-icon>
        </div>
      </el-card>
      
      <el-card class="summary-card" shadow="hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Ingresos Totales</p>
            <p class="text-2xl font-bold text-green-600">{{ formatCurrency(resumen.ingresosTotales) }}</p>
          </div>
          <el-icon class="text-3xl text-green-500"><Money /></el-icon>
        </div>
      </el-card>
      
      <el-card class="summary-card" shadow="hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Saldo Pendiente</p>
            <p class="text-2xl font-bold text-orange-600">{{ formatCurrency(resumen.saldoPendiente) }}</p>
          </div>
          <el-icon class="text-3xl text-orange-500"><Clock /></el-icon>
        </div>
      </el-card>
      
      <el-card class="summary-card" shadow="hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Promedio por Recibo</p>
            <p class="text-2xl font-bold text-purple-600">{{ formatCurrency(resumen.promedioRecibo) }}</p>
          </div>
          <el-icon class="text-3xl text-purple-500"><TrendCharts /></el-icon>
        </div>
      </el-card>
    </div>

    <!-- Tabla de datos -->
    <el-card class="data-table-card" shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">Datos del Reporte</h3>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">{{ recibos.length }} registros</span>
            <el-divider direction="vertical" />
            <el-button type="text" @click="toggleTableView">
              {{ vistaTabla === 'detallada' ? 'Vista Resumida' : 'Vista Detallada' }}
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        :data="recibos"
        :loading="loading"
        stripe
        border
        height="500"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="NumeroRecibo" label="Número" width="120" sortable />
        <el-table-column prop="FechaGeneracion" label="Fecha" width="120" sortable>
          <template #default="{ row }">
            {{ formatDateShort(row.FechaGeneracion) }}
          </template>
        </el-table-column>
        <el-table-column prop="ClienteNombre" label="Cliente" min-width="150" sortable />
        <el-table-column prop="VendedorNombre" label="Vendedor" min-width="150" sortable v-if="vistaTabla === 'detallada'" />
        <el-table-column prop="TipoPagoDescripcion" label="Tipo Pago" width="120" v-if="vistaTabla === 'detallada'" />
        <el-table-column prop="SaldoTotal" label="Saldo Total" width="120" sortable align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.SaldoTotal) }}
          </template>
        </el-table-column>
        <el-table-column prop="MontoPagado" label="Monto Pagado" width="120" sortable align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.MontoPagado) }}
          </template>
        </el-table-column>
        <el-table-column prop="SaldoPendiente" label="Saldo Pendiente" width="120" sortable align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.SaldoPendiente) }}
          </template>
        </el-table-column>
        <el-table-column prop="EstadoPago" label="Estado" width="100">
          <template #default="{ row }">
            <el-tag :type="getEstadoTagType(row.EstadoPago)" size="small">
              {{ row.EstadoPago }}
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
  DataAnalysis,
  Download,
  Refresh,
  Document,
  Money,
  Clock,
  TrendCharts
} from '@element-plus/icons-vue'
import type { ReciboDigital } from '@/lib/database.types'

const { obtenerRecibos, buscarRecibos, loading } = useRecibos()

// Estado
const recibos = ref<ReciboDigital[]>([])
const exporting = ref(false)
const vistaTabla = ref<'resumida' | 'detallada'>('resumida')

// Filtros
const filtros = reactive({
  fechas: null as [string, string] | null,
  vendedor: null as number | null,
  tipoPago: null as string | null,
  estadoPago: null as string | null
})

// Vendedores únicos para el filtro
const vendedores = computed(() => {
  const vendedoresUnicos = new Map()
  recibos.value.forEach(recibo => {
    if (recibo.IdVendedor && recibo.VendedorNombre) {
      vendedoresUnicos.set(recibo.IdVendedor, {
        id: recibo.IdVendedor,
        nombre: recibo.VendedorNombre
      })
    }
  })
  return Array.from(vendedoresUnicos.values())
})

// Resumen calculado
const resumen = computed(() => {
  const totalRecibos = recibos.value.length
  const ingresosTotales = recibos.value.reduce((sum, r) => sum + (r.MontoPagado || 0), 0)
  const saldoPendiente = recibos.value.reduce((sum, r) => sum + (r.SaldoPendiente || 0), 0)
  const promedioRecibo = totalRecibos > 0 ? ingresosTotales / totalRecibos : 0
  
  return {
    totalRecibos,
    ingresosTotales,
    saldoPendiente,
    promedioRecibo
  }
})

// Métodos
const cargarDatos = async () => {
  try {
    const filtrosApi = {
      ...(filtros.fechas && {
        fechaInicio: filtros.fechas[0],
        fechaFin: filtros.fechas[1]
      }),
      ...(filtros.vendedor && { idVendedor: filtros.vendedor }),
      ...(filtros.tipoPago && { tipoPago: filtros.tipoPago }),
      ...(filtros.estadoPago && { estado: filtros.estadoPago })
    }
    
    const result = await obtenerRecibos(filtrosApi)
    if (result.success) {
      recibos.value = result.data || []
    }
  } catch (error) {
    console.error('Error cargando datos:', error)
    ElMessage.error('Error al cargar los datos del reporte')
  }
}

const aplicarFiltros = () => {
  cargarDatos()
}

const exportarReporte = async () => {
  exporting.value = true
  try {
    // Simular exportación
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('Reporte exportado exitosamente')
  } catch (error) {
    ElMessage.error('Error al exportar el reporte')
  } finally {
    exporting.value = false
  }
}

const toggleTableView = () => {
  vistaTabla.value = vistaTabla.value === 'resumida' ? 'detallada' : 'resumida'
}

const handleSortChange = ({ prop, order }: any) => {
  // Implementar ordenamiento si es necesario
  console.log('Sort:', prop, order)
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(amount)
}

const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-PE')
}

const getEstadoTagType = (estado: string) => {
  const types: Record<string, string> = {
    'Cancelado': 'success',
    'Parcial': 'warning',
    'Pendiente': 'danger'
  }
  return types[estado] || 'info'
}

onMounted(() => {
  cargarDatos()
})
</script>

<style scoped>
.reportes-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.filters-card {
  border: 1px solid #e5e7eb;
}

.summary-card {
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.data-table-card {
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

.summary-section > * {
  animation: fadeInUp 0.6s ease-out;
}

.filters-card, .data-table-card {
  animation: fadeInUp 0.8s ease-out;
}
</style>