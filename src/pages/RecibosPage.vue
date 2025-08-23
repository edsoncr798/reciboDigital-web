<template>
  <div class="recibos-page">
    <!-- Header -->
    <div class="page-header mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 mb-2">Gestión de Recibos</h1>
          <p class="text-gray-600">Administra y supervisa todos los recibos digitales del sistema</p>
        </div>
        <div class="flex items-center space-x-3">
          <el-button type="success" :icon="Download" @click="exportSelected" :disabled="selectedRecibos.length === 0">
            Exportar Seleccionados ({{ selectedRecibos.length }})
          </el-button>
          <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">
            Nuevo Recibo
          </el-button>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <el-card class="filters-card mb-6" shadow="never">
      <div class="filters-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <el-input
          v-model="filters.numeroRecibo"
          placeholder="Buscar por número de recibo"
          :prefix-icon="Search"
          clearable
          @input="handleSearch"
        />
        
        <el-input
          v-model="filters.clienteNombre"
          placeholder="Buscar por cliente"
          :prefix-icon="Search"
          clearable
          @input="handleSearch"
        />
        
        <el-select
          v-model="filters.estado"
          placeholder="Estado de Pago"
          clearable
          @change="applyFilters"
        >
          <el-option label="Cancelado" value="Cancelado" />
          <el-option label="Parcial" value="Parcial" />
          <el-option label="Pendiente" value="Pendiente" />
        </el-select>
        
        <el-date-picker
          v-model="filters.fechaInicio"
          type="date"
          placeholder="Fecha inicio"
          format="DD/MM/YYYY"
          value-format="YYYY-MM-DD"
          @change="applyFilters"
        />
        
        <el-date-picker
          v-model="filters.fechaFin"
          type="date"
          placeholder="Fecha fin"
          format="DD/MM/YYYY"
          value-format="YYYY-MM-DD"
          @change="applyFilters"
        />
        
        <el-input-number
          v-model="filters.idVendedor"
          placeholder="ID Vendedor"
          :min="1"
          controls-position="right"
          class="w-full"
          @change="applyFilters"
        />
        
        <el-select
          v-model="filters.tipoPago"
          placeholder="Tipo de Pago"
          clearable
          @change="applyFilters"
        >
          <el-option label="Cancelación" value="cancelacion" />
          <el-option label="Amortización" value="amortizacion" />
        </el-select>
        
        <div class="flex items-center space-x-2">
          <el-button @click="clearFilters" :icon="Refresh">
            Limpiar
          </el-button>
          <el-button type="primary" @click="applyFilters" :icon="Search">
            Filtrar
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- Estadísticas rápidas -->
    <div class="stats-grid grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <el-card class="stat-card" shadow="hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Total Recibos</p>
            <p class="text-2xl font-bold text-blue-600">{{ stats.total }}</p>
          </div>
          <el-icon class="text-3xl text-blue-500"><Document /></el-icon>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Activos</p>
            <p class="text-2xl font-bold text-green-600">{{ stats.activos }}</p>
          </div>
          <el-icon class="text-3xl text-green-500"><SuccessFilled /></el-icon>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Pendientes</p>
            <p class="text-2xl font-bold text-yellow-600">{{ stats.pendientes }}</p>
          </div>
          <el-icon class="text-3xl text-yellow-500"><Clock /></el-icon>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Ingresos Total</p>
            <p class="text-2xl font-bold text-purple-600">{{ formatCurrency(stats.ingresos) }}</p>
          </div>
          <el-icon class="text-3xl text-purple-500"><Money /></el-icon>
        </div>
      </el-card>
    </div>

    <!-- Tabla de recibos -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">Lista de Recibos</h3>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">{{ pagination.total }} recibos encontrados</span>
            <el-divider direction="vertical" />
            <el-button-group>
              <el-button 
                :type="viewMode === 'table' ? 'primary' : 'default'"
                :icon="Grid"
                @click="viewMode = 'table'"
                size="small"
              />
              <el-button 
                :type="viewMode === 'cards' ? 'primary' : 'default'"
                :icon="List"
                @click="viewMode = 'cards'"
                size="small"
              />
            </el-button-group>
          </div>
        </div>
      </template>
      
      <!-- Vista de tabla -->
      <div v-if="viewMode === 'table'">
        <el-table
          ref="tableRef"
          :data="recibos"
          v-loading="loading"
          @selection-change="handleSelectionChange"
          @row-click="handleRowClick"
          stripe
          class="recibos-table"
        >
          <el-table-column type="selection" width="55" />
          
          <el-table-column prop="NumeroRecibo" label="Número" width="140" sortable>
            <template #default="{ row }">
              <el-button type="text" @click="viewReciboDetails(row)" class="font-mono text-blue-600">
                {{ row.NumeroRecibo }}
              </el-button>
            </template>
          </el-table-column>
          
          <el-table-column prop="ClienteNombre" label="Cliente" min-width="180">
            <template #default="{ row }">
              <div class="flex items-center space-x-2">
                <el-avatar :size="32" class="bg-blue-500">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <div>
                  <p class="font-medium text-gray-800">{{ row.ClienteNombre }}</p>
                  <p class="text-xs text-gray-500">{{ row.ClienteDocumento || 'Sin documento' }}</p>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="VendedorNombre" label="Vendedor" min-width="160">
            <template #default="{ row }">
              <div>
                <p class="font-medium text-gray-800">{{ row.VendedorNombre }}</p>
                <p class="text-xs text-gray-500">{{ row.VendedorCodigo }}</p>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="SaldoTotal" label="Saldo Total" width="120" sortable>
            <template #default="{ row }">
              <span class="font-semibold text-blue-600">
                {{ formatCurrency(row.SaldoTotal) }}
              </span>
            </template>
          </el-table-column>
          
          <el-table-column prop="MontoPagado" label="Pagado" width="120" sortable>
            <template #default="{ row }">
              <span class="font-semibold text-green-600">
                {{ formatCurrency(row.MontoPagado) }}
              </span>
            </template>
          </el-table-column>
          
          <el-table-column prop="EstadoPago" label="Estado" width="100">
            <template #default="{ row }">
              <el-tag :type="getEstadoTagType(row.EstadoPago)" size="small">
                {{ row.EstadoPago }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="FechaGeneracion" label="Fecha" width="120" sortable>
            <template #default="{ row }">
              <div class="text-sm">
                <p class="font-medium">{{ formatDate(row.FechaGeneracion) }}</p>
                <p class="text-gray-500">{{ formatTime(row.FechaGeneracion) }}</p>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="Acciones" width="120" fixed="right">
            <template #default="{ row }">
              <el-dropdown @command="(command) => handleAction(command, row)">
                <el-button type="text" :icon="MoreFilled" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="view">
                      <el-icon><View /></el-icon>
                      Ver Detalles
                    </el-dropdown-item>
                    <el-dropdown-item command="download">
                      <el-icon><Download /></el-icon>
                      Descargar PDF
                    </el-dropdown-item>
                    <el-dropdown-item command="edit" v-if="auth.isAdmin.value">
                      <el-icon><Edit /></el-icon>
                      Editar
                    </el-dropdown-item>
                    <el-dropdown-item command="cancel" divided v-if="row.EstadoPago === 'Pendiente' && auth.isAdmin.value">
                      <el-icon><Close /></el-icon>
                      Cancelar
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- Vista de tarjetas -->
      <div v-else class="cards-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ReciboCard
          v-for="recibo in recibos"
          :key="recibo.id"
          :recibo="recibo"
          @view="viewReciboDetails"
          @download="downloadRecibo"
          @edit="editRecibo"
          @cancel="cancelRecibo"
        />
      </div>
      
      <!-- Paginación -->
      <div class="pagination-container flex items-center justify-between mt-6">
        <div class="pagination-info text-sm text-gray-600">
          Mostrando {{ (pagination.currentPage - 1) * pagination.pageSize + 1 }} a 
          {{ Math.min(pagination.currentPage * pagination.pageSize, pagination.total) }} 
          de {{ pagination.total }} recibos
        </div>
        
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 25, 50, 100]"
          :total="pagination.total"
          layout="sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- Dialog para crear/editar recibo -->
    <el-dialog
      v-model="showCreateDialog"
      title="Crear Nuevo Recibo"
      width="600px"
      :before-close="handleCloseDialog"
    >
      <ReciboForm
        :recibo="selectedRecibo"
        @save="handleSaveRecibo"
        @cancel="showCreateDialog = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useRecibos } from '@/composables/useRecibos'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Download,
  Plus,
  Refresh,
  Document,
  SuccessFilled,
  Clock,
  Money,
  Grid,
  List,
  User,
  MoreFilled,
  View,
  Edit,
  Close
} from '@element-plus/icons-vue'
import ReciboCard from '@/components/ReciboCard.vue'
import ReciboForm from '@/components/ReciboForm.vue'
import type { ReciboDigital, ReciboFilters } from '@/lib/database.types'

const router = useRouter()
const auth = useAuth()
const recibosComposable = useRecibos()

// Estado reactivo
const viewMode = ref<'table' | 'cards'>('table')
const showCreateDialog = ref(false)
const selectedRecibo = ref<ReciboDigital | null>(null)
const selectedRecibos = ref<ReciboDigital[]>([])
const tableRef = ref()

// Filtros
const filters = reactive<ReciboFilters & { numeroRecibo?: string; clienteNombre?: string }>({
  numeroRecibo: '',
  clienteNombre: '',
  estado: '',
  fechaInicio: '',
  fechaFin: '',
  idVendedor: undefined,
  tipoPago: ''
})

// Paginación
const pagination = reactive({
  currentPage: 1,
  pageSize: 25,
  total: 0
})

// Estadísticas computadas
const stats = computed(() => {
  const recibosData = recibosComposable.recibos.value
  return {
    total: recibosData.length,
    activos: recibosData.filter(r => r.Estado === 'procesado').length,
    pendientes: recibosData.filter(r => r.TipoPago === 'amortizacion').length,
    cancelados: recibosData.filter(r => r.TipoPago === 'cancelacion').length,
    ingresos: recibosData.reduce((sum, r) => sum + r.MontoPagado, 0)
  }
})

// Usar recibos del composable
const recibos = computed(() => recibosComposable.recibos.value)
const loading = computed(() => recibosComposable.loading.value)

// Los recibos se obtienen de la API externa a través del composable

// Métodos
const loadRecibos = async () => {
  try {
    const filtrosAPI: ReciboFilters = {
      estado: filters.estado || undefined,
      fechaInicio: filters.fechaInicio || undefined,
      fechaFin: filters.fechaFin || undefined,
      idVendedor: filters.idVendedor || undefined,
      tipoPago: filters.tipoPago || undefined,
      numeroRecibo: filters.numeroRecibo || undefined,
      clienteNombre: filters.clienteNombre || undefined
    }
    
    await recibosComposable.obtenerRecibos(filtrosAPI)
    pagination.total = recibosComposable.recibos.value.length
  } catch (error) {
    ElMessage.error('Error al cargar los recibos')
    console.error('Error cargando recibos:', error)
  }
}

const handleSearch = async () => {
  if (filters.numeroRecibo?.trim() || filters.clienteNombre?.trim()) {
    try {
      const filtrosBusqueda: ReciboFilters = {
        numeroRecibo: filters.numeroRecibo || undefined,
        clienteNombre: filters.clienteNombre || undefined
      }
      await recibosComposable.buscarRecibosAvanzado(filtrosBusqueda)
    } catch (error) {
      ElMessage.error('Error al buscar recibos')
    }
  } else {
    applyFilters()
  }
}

const applyFilters = () => {
  // Aplicar filtros y recargar datos
  pagination.currentPage = 1
  loadRecibos()
}

const clearFilters = () => {
  Object.assign(filters, {
    numeroRecibo: '',
    clienteNombre: '',
    estado: '',
    fechaInicio: '',
    fechaFin: '',
    idVendedor: undefined,
    tipoPago: ''
  })
  applyFilters()
}

const handleSelectionChange = (selection: ReciboDigital[]) => {
  selectedRecibos.value = selection
}

const handleRowClick = (row: ReciboDigital) => {
  viewReciboDetails(row)
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadRecibos()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadRecibos()
}

const viewReciboDetails = (recibo: ReciboDigital) => {
  router.push(`/recibos/${recibo.ReciboId}`)
}

const downloadRecibo = async (recibo: ReciboDigital) => {
  try {
    // Implementar descarga de PDF
    ElMessage.success(`Descargando recibo ${recibo.NumeroRecibo}`)
  } catch (error) {
    ElMessage.error('Error al descargar el recibo')
  }
}

const editRecibo = (recibo: ReciboDigital) => {
  selectedRecibo.value = recibo
  showCreateDialog.value = true
}

const cancelRecibo = async (recibo: ReciboDigital) => {
  try {
    await ElMessageBox.confirm(
      `¿Estás seguro de cancelar el recibo ${recibo.NumeroRecibo}?`,
      'Confirmar Cancelación',
      {
        confirmButtonText: 'Sí, Cancelar',
        cancelButtonText: 'No',
        type: 'warning'
      }
    )
    
    // Nota: La API externa no soporta actualización de recibos
    ElMessage.warning('La cancelación de recibos no está disponible en la API externa')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Error al cancelar el recibo')
    }
  }
}

const handleAction = (command: string, recibo: ReciboDigital) => {
  switch (command) {
    case 'view':
      viewReciboDetails(recibo)
      break
    case 'download':
      downloadRecibo(recibo)
      break
    case 'edit':
      editRecibo(recibo)
      break
    case 'cancel':
      cancelRecibo(recibo)
      break
  }
}

const exportSelected = async () => {
  if (selectedRecibos.value.length === 0) {
    ElMessage.warning('Selecciona al menos un recibo para exportar')
    return
  }
  
  try {
    // Implementar exportación
    ElMessage.success(`Exportando ${selectedRecibos.value.length} recibos`)
  } catch (error) {
    ElMessage.error('Error al exportar los recibos')
  }
}

const handleSaveRecibo = async (reciboData: any) => {
  try {
    if (selectedRecibo.value) {
      // Nota: La API externa no soporta actualización de recibos
      ElMessage.warning('La edición de recibos no está disponible en la API externa')
    } else {
      // Nota: La API externa no soporta creación de recibos
      ElMessage.warning('La creación de recibos no está disponible en la API externa')
    }
    
    showCreateDialog.value = false
    selectedRecibo.value = null
  } catch (error) {
    ElMessage.error('Error al guardar el recibo')
  }
}

const handleCloseDialog = () => {
  selectedRecibo.value = null
  showCreateDialog.value = false
}

// Helpers
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(amount)
}

const formatDate = (timestamp: any) => {
  const date = timestamp instanceof Date ? timestamp : 
               timestamp?.toDate ? timestamp.toDate() : 
               new Date(timestamp)
  return date.toLocaleDateString('es-PE')
}

const formatTime = (timestamp: any) => {
  const date = timestamp instanceof Date ? timestamp : 
               timestamp?.toDate ? timestamp.toDate() : 
               new Date(timestamp)
  return date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit'
  })
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
  loadRecibos()
})
</script>

<style scoped>
.recibos-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.filters-card {
  border: 1px solid #e5e7eb;
}

.stat-card {
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.table-card {
  border: 1px solid #e5e7eb;
}

.recibos-table {
  border-radius: 8px;
  overflow: hidden;
}

.recibos-table :deep(.el-table__row) {
  cursor: pointer;
  transition: all 0.2s ease;
}

.recibos-table :deep(.el-table__row:hover) {
  background-color: #f8fafc;
}

.cards-grid {
  min-height: 400px;
}

.pagination-container {
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
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

.stats-grid > * {
  animation: fadeInUp 0.6s ease-out;
}

.table-card {
  animation: fadeInUp 0.8s ease-out;
}

/* Responsive */
@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>