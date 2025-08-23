<template>
  <el-card class="recibo-card" shadow="hover" :body-style="{ padding: '20px' }">
    <div class="card-header flex items-center justify-between mb-4">
      <div class="recibo-number">
        <h4 class="text-lg font-semibold text-gray-800 font-mono">
          {{ recibo.NumeroRecibo }}
        </h4>
        <el-tag :type="getEstadoTagType(recibo.EstadoPago)" size="small" class="mt-1">
          {{ recibo.EstadoPago }}
        </el-tag>
      </div>
      <div class="card-actions">
        <el-dropdown @command="handleAction" trigger="click">
          <el-button type="text" :icon="MoreFilled" class="text-gray-500 hover:text-gray-700" />
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
              <el-dropdown-item command="cancel" divided v-if="recibo.EstadoPago === 'Pendiente' && auth.isAdmin.value">
                <el-icon><Close /></el-icon>
                Cancelar
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    
    <div class="card-content space-y-3">
      <!-- Cliente -->
      <div class="user-info flex items-center space-x-3">
        <el-avatar :size="40" class="bg-blue-500">
          <el-icon><User /></el-icon>
        </el-avatar>
        <div class="flex-1">
          <p class="font-medium text-gray-800">{{ recibo.ClienteNombre }}</p>
          <p class="text-sm text-gray-500">{{ recibo.ClienteDocumento || 'Sin documento' }}</p>
        </div>
      </div>
      
      <!-- Vendedor -->
      <div class="vendor-info flex items-center space-x-3 bg-gray-50 rounded-lg p-2">
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-700">Vendedor: {{ recibo.VendedorNombre }}</p>
          <p class="text-xs text-gray-500">Código: {{ recibo.VendedorCodigo }} | DNI: {{ recibo.VendedorDni }}</p>
        </div>
      </div>
      
      <!-- Información Financiera -->
      <div class="amount-info bg-gray-50 rounded-lg p-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Saldo Total</span>
          <span class="text-xl font-bold text-blue-600">
            {{ formatCurrency(recibo.SaldoTotal) }}
          </span>
        </div>
        <div class="flex items-center justify-between mt-1">
          <span class="text-xs text-gray-500">Monto Pagado</span>
          <span class="text-sm font-medium text-green-600">{{ formatCurrency(recibo.MontoPagado) }}</span>
        </div>
        <div class="flex items-center justify-between mt-1">
          <span class="text-xs text-gray-500">Saldo Pendiente</span>
          <span class="text-sm font-medium text-red-600">{{ formatCurrency(recibo.SaldoPendiente) }}</span>
        </div>
        <div class="flex items-center justify-between mt-1">
          <span class="text-xs text-gray-500">Tipo de Pago</span>
          <span class="text-sm font-medium text-gray-700">{{ recibo.TipoPagoDescripcion }}</span>
        </div>
      </div>
      
      <!-- Fecha -->
      <div class="date-info flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <el-icon class="text-gray-400"><Calendar /></el-icon>
          <span class="text-sm text-gray-600">Fecha de Generación</span>
        </div>
        <div class="text-right">
          <p class="text-sm font-medium text-gray-800">{{ formatDate(recibo.FechaGeneracion) }}</p>
          <p class="text-xs text-gray-500">{{ formatTime(recibo.FechaGeneracion) }}</p>
        </div>
      </div>
      
      <!-- Información del Documento -->
      <div class="document-info flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600">Comprobante</span>
        </div>
        <div class="text-right">
          <p class="text-sm font-medium text-gray-800">{{ recibo.NumeroComprobante }}</p>
          <p class="text-xs text-gray-500">{{ recibo.TipoDocumento }}</p>
        </div>
      </div>
      
      <!-- Método de Pago -->
      <div class="payment-info bg-blue-50 rounded-lg p-2">
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-600">Método de Pago</span>
          <span class="text-sm font-medium text-blue-700">{{ recibo.MetodoPago }}</span>
        </div>
        <div v-if="recibo.NumeroCheque" class="flex items-center justify-between mt-1">
          <span class="text-xs text-gray-500">Núm. Cheque</span>
          <span class="text-xs text-gray-700">{{ recibo.NumeroCheque }}</span>
        </div>
        <div v-if="recibo.NumeroCuenta" class="flex items-center justify-between mt-1">
          <span class="text-xs text-gray-500">Núm. Cuenta</span>
          <span class="text-xs text-gray-700">{{ recibo.NumeroCuenta }}</span>
        </div>
      </div>
    </div>
    
    <div class="card-footer mt-4 pt-4 border-t border-gray-100">
      <div class="flex items-center justify-between">
        <el-button 
          type="primary" 
          size="small" 
          @click="$emit('view', recibo)"
          class="flex-1 mr-2"
        >
          <el-icon class="mr-1"><View /></el-icon>
          Ver Detalles
        </el-button>
        <el-button 
          type="success" 
          size="small" 
          @click="$emit('download', recibo)"
          class="flex-1 ml-2"
        >
          <el-icon class="mr-1"><Download /></el-icon>
          Descargar
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { ElMessage } from 'element-plus'
import {
  MoreFilled,
  View,
  Download,
  Edit,
  Close,
  User,
  Calendar,
  CopyDocument
} from '@element-plus/icons-vue'
import type { ReciboDigital } from '@/lib/database.types'

type Recibo = ReciboDigital

interface Props {
  recibo: Recibo
}

interface Emits {
  view: [recibo: Recibo]
  download: [recibo: Recibo]
  edit: [recibo: Recibo]
  cancel: [recibo: Recibo]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const auth = useAuth()

// Métodos
const handleAction = (command: string) => {
  switch (command) {
    case 'view':
      emit('view', props.recibo)
      break
    case 'download':
      emit('download', props.recibo)
      break
    case 'edit':
      emit('edit', props.recibo)
      break
    case 'cancel':
      emit('cancel', props.recibo)
      break
  }
}

const copyReceipt = async () => {
  try {
    await navigator.clipboard.writeText(props.recibo.NumeroRecibo)
    ElMessage.success('Número de recibo copiado al portapapeles')
  } catch (error) {
    ElMessage.error('Error al copiar el número de recibo')
  }
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
</script>

<style scoped>
.recibo-card {
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  cursor: pointer;
}

.recibo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-header {
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.amount-info {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
}

.hash-info {
  background-color: #fafafa;
  border-radius: 6px;
  padding: 8px;
}

.card-footer {
  background-color: #fafafa;
  margin: 1rem -20px -20px -20px;
  padding: 1rem 20px;
  border-radius: 0 0 8px 8px;
}

/* Animaciones */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.recibo-card {
  animation: slideInUp 0.6s ease-out;
}

/* Estados de hover para elementos interactivos */
.user-info {
  transition: all 0.2s ease;
}

.recibo-card:hover .user-info {
  transform: translateX(2px);
}

/* Responsive */
@media (max-width: 640px) {
  .card-footer .el-button {
    font-size: 12px;
    padding: 8px 12px;
  }
}
</style>