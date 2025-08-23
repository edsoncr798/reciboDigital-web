<template>
  <div class="recibo-detalle-page">
    <div class="page-header mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <el-button @click="$router.go(-1)" :icon="ArrowLeft">
            Volver
          </el-button>
          <div v-if="recibo">
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Recibo {{ recibo.NumeroRecibo }}</h1>
            <p class="text-gray-600">{{ recibo.ClienteNombre }} - {{ formatDate(recibo.FechaGeneracion) }}</p>
          </div>
          <div v-else>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Detalle del Recibo</h1>
            <p class="text-gray-600">Cargando información...</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <el-button type="success" :icon="Download" @click="downloadRecibo" :disabled="!recibo">
            Descargar PDF
          </el-button>
          <el-button type="info" :icon="Edit" disabled>
            Editar (No disponible)
          </el-button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-12">
      <el-icon class="text-6xl text-blue-500 mb-4 animate-spin"><Loading /></el-icon>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">Cargando recibo...</h3>
      <p class="text-gray-500">Obteniendo información de la base de datos</p>
    </div>

    <!-- Error state -->
    <el-alert
      v-else-if="error"
      title="Error al cargar el recibo"
      type="error"
      :description="error"
      show-icon
      :closable="false"
    />

    <!-- Recibo details -->
    <div v-else-if="recibo" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Información principal -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Información básica -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <h3 class="text-lg font-semibold text-gray-800">Información del Recibo</h3>
          </template>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="info-item">
              <label class="info-label">Número de Recibo</label>
              <p class="info-value font-mono">{{ recibo.NumeroRecibo }}</p>
            </div>
            
            <div class="info-item">
              <label class="info-label">Número de Comprobante</label>
              <p class="info-value font-mono">{{ recibo.NumeroComprobante }}</p>
            </div>
            
            <div class="info-item">
              <label class="info-label">Fecha de Generación</label>
              <p class="info-value">{{ formatDate(recibo.FechaGeneracion) }}</p>
            </div>
            
            <div class="info-item">
              <label class="info-label">Estado</label>
              <el-tag :type="getEstadoTagType(recibo.EstadoPago)" size="large">
                {{ recibo.EstadoPago }}
              </el-tag>
            </div>
            
            <div class="info-item">
              <label class="info-label">Tipo de Documento</label>
              <p class="info-value">{{ recibo.TipoDocumento }}</p>
            </div>
            
            <div class="info-item" v-if="recibo.DiasPago">
              <label class="info-label">Días de Pago</label>
              <p class="info-value">{{ recibo.DiasPago }} días</p>
            </div>
          </div>
        </el-card>

        <!-- Información del cliente -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <h3 class="text-lg font-semibold text-gray-800">Información del Cliente</h3>
          </template>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="info-item">
              <label class="info-label">Nombre del Cliente</label>
              <p class="info-value">{{ recibo.ClienteNombre }}</p>
            </div>
            
            <div class="info-item" v-if="recibo.ClienteDocumento">
              <label class="info-label">Documento</label>
              <p class="info-value">{{ recibo.ClienteDocumento }}</p>
            </div>
          </div>
        </el-card>

        <!-- Información del vendedor -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <h3 class="text-lg font-semibold text-gray-800">Información del Vendedor</h3>
          </template>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="info-item">
              <label class="info-label">Nombre del Vendedor</label>
              <p class="info-value">{{ recibo.VendedorNombre }}</p>
            </div>
            
            <div class="info-item">
              <label class="info-label">Código del Vendedor</label>
              <p class="info-value font-mono">{{ recibo.VendedorCodigo }}</p>
            </div>
            
            <div class="info-item">
              <label class="info-label">DNI del Vendedor</label>
              <p class="info-value">{{ recibo.VendedorDni }}</p>
            </div>
            
            <div class="info-item">
              <label class="info-label">ID del Vendedor</label>
              <p class="info-value">{{ recibo.IdVendedor }}</p>
            </div>
          </div>
        </el-card>

        <!-- Información de pago -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <h3 class="text-lg font-semibold text-gray-800">Información de Pago</h3>
          </template>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="info-item">
              <label class="info-label">Tipo de Pago</label>
              <p class="info-value">{{ recibo.TipoPagoDescripcion }}</p>
            </div>
            
            <div class="info-item">
              <label class="info-label">Método de Pago</label>
              <p class="info-value">{{ recibo.MetodoPago }}</p>
            </div>
            
            <div class="info-item" v-if="recibo.NumeroCheque">
              <label class="info-label">Número de Cheque</label>
              <p class="info-value font-mono">{{ recibo.NumeroCheque }}</p>
            </div>
            
            <div class="info-item" v-if="recibo.NumeroCuenta">
              <label class="info-label">Número de Cuenta</label>
              <p class="info-value font-mono">{{ recibo.NumeroCuenta }}</p>
            </div>
          </div>
        </el-card>
      </div>

      <!-- Resumen financiero -->
      <div class="space-y-6">
        <el-card class="summary-card" shadow="never">
          <template #header>
            <h3 class="text-lg font-semibold text-gray-800">Resumen Financiero</h3>
          </template>
          
          <div class="space-y-4">
            <div class="summary-item">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Saldo Total</span>
                <span class="text-2xl font-bold text-blue-600">
                  {{ formatCurrency(recibo.SaldoTotal) }}
                </span>
              </div>
            </div>
            
            <div class="summary-item">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Monto Pagado</span>
                <span class="text-xl font-semibold text-green-600">
                  {{ formatCurrency(recibo.MontoPagado) }}
                </span>
              </div>
            </div>
            
            <div class="summary-item border-t pt-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Saldo Pendiente</span>
                <span class="text-xl font-semibold text-red-600">
                  {{ formatCurrency(recibo.SaldoPendiente) }}
                </span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- Firmas digitales -->
        <el-card v-if="recibo.FirmaVendedor || recibo.FirmaCliente" class="signatures-card" shadow="never">
          <template #header>
            <h3 class="text-lg font-semibold text-gray-800">Firmas Digitales</h3>
          </template>
          
          <div class="space-y-4">
            <div v-if="recibo.FirmaVendedor" class="signature-item">
              <label class="info-label">Firma del Vendedor</label>
              <div class="signature-preview bg-gray-50 rounded-lg p-4 text-center">
                <img v-if="isValidBase64(recibo.FirmaVendedor)" :src="'data:image/png;base64,' + recibo.FirmaVendedor" alt="Firma del Vendedor" class="max-w-full h-auto" />
                <p v-else class="text-gray-500 text-sm">Firma disponible</p>
              </div>
            </div>
            
            <div v-if="recibo.FirmaCliente" class="signature-item">
              <label class="info-label">Firma del Cliente</label>
              <div class="signature-preview bg-gray-50 rounded-lg p-4 text-center">
                <img v-if="isValidBase64(recibo.FirmaCliente)" :src="'data:image/png;base64,' + recibo.FirmaCliente" alt="Firma del Cliente" class="max-w-full h-auto" />
                <p v-else class="text-gray-500 text-sm">Firma disponible</p>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- Not found state -->
    <el-card v-else>
      <div class="text-center py-12">
        <el-icon class="text-6xl text-gray-400 mb-4"><Document /></el-icon>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Recibo no encontrado</h3>
        <p class="text-gray-500">El recibo solicitado no existe o no está disponible</p>
        <p class="text-sm text-gray-400 mt-2">ID: {{ $route.params.id }}</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRecibos } from '@/composables/useRecibos'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Download, Edit, Document, Loading } from '@element-plus/icons-vue'
import type { ReciboDigital } from '@/lib/database.types'

const route = useRoute()
const { obtenerReciboPorNumero } = useRecibos()

// Estado
const recibo = ref<ReciboDigital | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Métodos
const loadRecibo = async () => {
  try {
    loading.value = true
    error.value = null
    
    const reciboId = route.params.id as string
    const result = await obtenerReciboPorNumero(reciboId)
    
    if (result) {
      recibo.value = result
    } else {
      error.value = 'Recibo no encontrado'
    }
  } catch (err: any) {
    error.value = err.message || 'Error al cargar el recibo'
    console.error('Error cargando recibo:', err)
  } finally {
    loading.value = false
  }
}

const downloadRecibo = () => {
  if (recibo.value) {
    ElMessage.success(`Descargando recibo ${recibo.value.NumeroRecibo}`)
    // Aquí se implementaría la descarga real del PDF
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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

const isValidBase64 = (str: string) => {
  try {
    return btoa(atob(str)) === str
  } catch (err) {
    return false
  }
}

onMounted(() => {
  loadRecibo()
})
</script>

<style scoped>
.recibo-detalle-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.info-card {
  border: 1px solid #e5e7eb;
}

.info-item {
  padding: 0.75rem 0;
}

.info-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.summary-card {
  border: 2px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.summary-item {
  padding: 0.75rem 0;
}

.signatures-card {
  border: 1px solid #e5e7eb;
}

.signature-item {
  margin-bottom: 1rem;
}

.signature-preview {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.signature-preview img {
  max-height: 150px;
  border-radius: 4px;
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

.info-card, .summary-card, .signatures-card {
  animation: fadeInUp 0.6s ease-out;
}

/* Responsive */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>