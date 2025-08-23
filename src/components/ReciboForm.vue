<template>
  <div class="recibo-form">
    <!-- NOTA: Este formulario está deshabilitado porque la API externa es solo de lectura -->
    <el-alert
      title="Funcionalidad no disponible"
      type="warning"
      :closable="false"
      class="mb-4"
    >
      <template #default>
        <p>La creación y edición de recibos no está disponible.</p>
        <p>La API externa es solo de lectura para visualización y control de recibos existentes.</p>
      </template>
    </el-alert>
    
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="140px"
      label-position="top"
      class="space-y-4"
      :disabled="true"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Número de recibo -->
        <el-form-item label="Número de Recibo" prop="numero_recibo">
          <el-input
            v-model="form.numero_recibo"
            placeholder="REC-2024-001"
            :disabled="isEditing"
            class="font-mono"
          >
            <template #prefix>
              <el-icon><Document /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <!-- Usuario -->
        <el-form-item label="Usuario" prop="usuario_id">
          <el-select
            v-model="form.usuario_id"
            placeholder="Seleccionar usuario"
            filterable
            remote
            :remote-method="searchUsuarios"
            :loading="loadingUsuarios"
            class="w-full"
          >
            <el-option
              v-for="usuario in usuarios"
              :key="usuario.id"
              :label="`${usuario.nombreCompleto} (${usuario.email})`"
              :value="usuario.id"
            >
              <div class="flex items-center space-x-2">
                <el-avatar :size="24" class="bg-blue-500">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <div>
                  <p class="text-sm font-medium">{{ usuario.nombreCompleto }}</p>
                  <p class="text-xs text-gray-500">{{ usuario.email }}</p>
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Monto -->
        <el-form-item label="Monto Total" prop="monto_total">
          <el-input-number
            v-model="form.monto_total"
            :min="0"
            :precision="2"
            :step="0.01"
            controls-position="right"
            class="w-full"
          >
            <template #prefix>
              <span class="text-gray-500">S/</span>
            </template>
          </el-input-number>
        </el-form-item>
        
        <!-- Moneda -->
        <el-form-item label="Moneda" prop="moneda">
          <el-select v-model="form.moneda" class="w-full">
            <el-option label="Sol Peruano (PEN)" value="PEN" />
            <el-option label="Dólar Americano (USD)" value="USD" />
            <el-option label="Euro (EUR)" value="EUR" />
          </el-select>
        </el-form-item>
        
        <!-- Estado -->
        <el-form-item label="Estado" prop="estado">
          <el-select v-model="form.estado" class="w-full">
            <el-option label="Activo" value="activo" />
            <el-option label="Pendiente" value="pendiente" />
            <el-option label="Cancelado" value="cancelado" />
          </el-select>
        </el-form-item>
      </div>
      
      <!-- Plantilla -->
      <el-form-item label="Plantilla" prop="plantilla_id">
        <el-select v-model="form.plantilla_id" placeholder="Seleccionar plantilla" class="w-full">
          <el-option
            v-for="plantilla in plantillas"
            :key="plantilla.id"
            :label="plantilla.nombre"
            :value="plantilla.id"
          >
            <div>
              <p class="font-medium">{{ plantilla.nombre }}</p>
              <p class="text-xs text-gray-500">{{ plantilla.descripcion }}</p>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      
      <!-- Fecha de emisión -->
      <el-form-item label="Fecha de Emisión" prop="fecha_emision">
        <el-date-picker
          v-model="form.fecha_emision"
          type="datetime"
          placeholder="Seleccionar fecha y hora"
          format="DD/MM/YYYY HH:mm"
          value-format="YYYY-MM-DD HH:mm:ss"
          class="w-full"
        />
      </el-form-item>
      
      <!-- Detalles del recibo -->
      <el-form-item label="Detalles del Recibo">
        <div class="w-full space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium text-gray-700">Conceptos</h4>
            <el-button type="primary" size="small" @click="addDetalle" :icon="Plus">
              Agregar Concepto
            </el-button>
          </div>
          
          <div v-if="form.detalles.length === 0" class="text-center py-8 text-gray-500">
            <el-icon class="text-4xl mb-2"><DocumentAdd /></el-icon>
            <p>No hay conceptos agregados</p>
            <p class="text-sm">Haz clic en "Agregar Concepto" para comenzar</p>
          </div>
          
          <div v-else class="space-y-3">
            <el-card
              v-for="(detalle, index) in form.detalles"
              :key="index"
              class="detalle-card"
              shadow="never"
            >
              <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                <el-form-item :label="`Concepto ${index + 1}`" class="mb-0">
                  <el-input
                    v-model="detalle.concepto"
                    placeholder="Descripción del concepto"
                  />
                </el-form-item>
                
                <el-form-item label="Cantidad" class="mb-0">
                  <el-input-number
                    v-model="detalle.cantidad"
                    :min="1"
                    :precision="2"
                    controls-position="right"
                    class="w-full"
                    @change="calculateSubtotal(index)"
                  />
                </el-form-item>
                
                <el-form-item label="Precio Unitario" class="mb-0">
                  <el-input-number
                    v-model="detalle.precio_unitario"
                    :min="0"
                    :precision="2"
                    :step="0.01"
                    controls-position="right"
                    class="w-full"
                    @change="calculateSubtotal(index)"
                  />
                </el-form-item>
                
                <div class="flex items-end space-x-2">
                  <el-form-item label="Subtotal" class="mb-0 flex-1">
                    <el-input
                      :value="formatCurrency(detalle.subtotal)"
                      readonly
                      class="subtotal-input"
                    />
                  </el-form-item>
                  <el-button
                    type="danger"
                    size="small"
                    @click="removeDetalle(index)"
                    :icon="Delete"
                    class="mb-0"
                  />
                </div>
              </div>
            </el-card>
          </div>
          
          <!-- Total calculado -->
          <div v-if="form.detalles.length > 0" class="total-section bg-gray-50 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <span class="text-lg font-medium text-gray-700">Total Calculado:</span>
              <span class="text-2xl font-bold text-green-600">
                {{ formatCurrency(totalCalculado) }}
              </span>
            </div>
            <div class="flex items-center justify-between mt-2 text-sm text-gray-600">
              <span>Conceptos: {{ form.detalles.length }}</span>
              <el-button
                type="text"
                size="small"
                @click="syncTotal"
                class="text-blue-600"
              >
                Sincronizar con monto total
              </el-button>
            </div>
          </div>
        </div>
      </el-form-item>
      
      <!-- Metadatos adicionales -->
      <el-form-item label="Información Adicional">
        <el-input
          v-model="form.metadatos.notas"
          type="textarea"
          :rows="3"
          placeholder="Notas o información adicional sobre el recibo"
        />
      </el-form-item>
    </el-form>
    
    <!-- Acciones -->
    <div class="form-actions flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
      <el-button @click="$emit('cancel')" size="large">
        Cancelar
      </el-button>
      <el-button
        type="primary"
        @click="handleSave"
        :loading="saving"
        size="large"
        disabled
      >
        {{ isEditing ? 'Actualizar' : 'Crear' }} Recibo (No disponible)
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  Document,
  User,
  Plus,
  DocumentAdd,
  Delete
} from '@element-plus/icons-vue'
import type { ReciboDigital, UsuarioApp, PlantillaRecibo } from '@/lib/database.types'

type Recibo = ReciboDigital
type Usuario = UsuarioApp
type Plantilla = PlantillaRecibo

interface DetalleRecibo {
  concepto: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

interface Props {
  recibo?: Recibo | null
}

interface Emits {
  save: [data: any]
  cancel: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Referencias
const formRef = ref<FormInstance>()
const saving = ref(false)
const loadingUsuarios = ref(false)

// Estado
const usuarios = ref<Usuario[]>([])
const plantillas = ref<Plantilla[]>([
  {
    id: '1',
    nombre: 'Plantilla Básica',
    descripcion: 'Plantilla estándar para recibos',
    estructura_campos: {},
    estilos_css: null,
    activa: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '2',
    nombre: 'Plantilla Detallada',
    descripcion: 'Plantilla con campos adicionales',
    estructura_campos: {},
    estilos_css: null,
    activa: true,
    created_at: new Date(),
    updated_at: new Date()
  }
])

// Formulario
const form = reactive({
  numero_recibo: '',
  usuario_id: '',
  plantilla_id: '',
  monto_total: 0,
  moneda: 'PEN',
  estado: 'activo',
  fecha_emision: new Date().toISOString().slice(0, 19),
  detalles: [] as DetalleRecibo[],
  metadatos: {
    notas: ''
  }
})

// Reglas de validación
const rules: FormRules = {
  numero_recibo: [
    { required: true, message: 'El número de recibo es requerido', trigger: 'blur' }
  ],
  usuario_id: [
    { required: true, message: 'Debe seleccionar un usuario', trigger: 'change' }
  ],
  monto_total: [
    { required: true, message: 'El monto total es requerido', trigger: 'blur' },
    { type: 'number', min: 0.01, message: 'El monto debe ser mayor a 0', trigger: 'blur' }
  ],
  plantilla_id: [
    { required: true, message: 'Debe seleccionar una plantilla', trigger: 'change' }
  ]
}

// Computed
const isEditing = computed(() => !!props.recibo)

const totalCalculado = computed(() => {
  return form.detalles.reduce((total, detalle) => total + detalle.subtotal, 0)
})

// Métodos
const searchUsuarios = async (query: string) => {
  if (query) {
    loadingUsuarios.value = true
    try {
      // Simular búsqueda de usuarios
      await new Promise(resolve => setTimeout(resolve, 500))
      const mockUsuarios = [
        {
          id: '1',
          email: 'juan.perez@email.com',
          nombre_completo: 'Juan Pérez García',
          telefono: '+52 55 1234 5678',
          estado_cuenta: 'activo' as const,
          configuraciones: {},
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '2',
          email: 'maria.garcia@email.com',
          nombre_completo: 'María García López',
          telefono: '+52 55 9876 5432',
          estado_cuenta: 'activo' as const,
          configuraciones: {},
          created_at: new Date(),
          updated_at: new Date()
        }
      ]
      
      const filteredUsers = []
      for (const user of mockUsuarios) {
        const queryLower = query.toLowerCase()
        if (user.nombre_completo.toLowerCase().includes(queryLower) || 
            user.email.toLowerCase().includes(queryLower)) {
          filteredUsers.push(user)
        }
      }
      usuarios.value = filteredUsers as Usuario[]
    } finally {
      loadingUsuarios.value = false
    }
  }
}

const addDetalle = () => {
  form.detalles.push({
    concepto: '',
    cantidad: 1,
    precio_unitario: 0,
    subtotal: 0
  })
}

const removeDetalle = (index: number) => {
  form.detalles.splice(index, 1)
}

const calculateSubtotal = (index: number) => {
  const detalle = form.detalles[index]
  detalle.subtotal = detalle.cantidad * detalle.precio_unitario
}

const syncTotal = () => {
  form.monto_total = totalCalculado.value
}

const generateNumeroRecibo = () => {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `REC-${year}${month}-${random}`
}

const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    saving.value = true
    
    // Validaciones adicionales
    if (form.detalles.length === 0) {
      ElMessage.warning('Debe agregar al menos un concepto al recibo')
      return
    }
    
    if (Math.abs(totalCalculado.value - form.monto_total) > 0.01) {
      ElMessage.warning('El monto total no coincide con la suma de los conceptos')
      return
    }
    
    // Preparar datos para envío
    const reciboData = {
      ...form,
      hash_verificacion: generateHash(),
      datos_recibo: {
        detalles: form.detalles,
        metadatos: form.metadatos
      }
    }
    
    emit('save', reciboData)
  } catch (error) {
    ElMessage.error('Error en la validación del formulario')
  } finally {
    saving.value = false
  }
}

const generateHash = () => {
  // Generar hash simple para demo
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(amount)
}

const loadFormData = () => {
  if (props.recibo) {
    // NOTA: Este formulario está deshabilitado para la API externa
    // Los campos se mapean desde la nueva estructura pero el formulario no es funcional
    const fechaEmision = props.recibo.FechaGeneracion || new Date().toISOString().slice(0, 19)
    
    Object.assign(form, {
      numero_recibo: props.recibo.NumeroRecibo,
      usuario_id: props.recibo.IdVendedor?.toString() || '',
      plantilla_id: '', // No disponible en la API externa
      monto_total: props.recibo.SaldoTotal,
      moneda: 'PEN', // Valor por defecto
      estado: props.recibo.EstadoPago,
      fecha_emision: fechaEmision,
      detalles: [], // No disponible en la API externa
      metadatos: { notas: '' } // No disponible en la API externa
    })
  } else {
    // Generar número de recibo automáticamente para nuevos recibos
    form.numero_recibo = generateNumeroRecibo()
  }
}

// Watchers
watch(() => props.recibo, loadFormData, { immediate: true })

onMounted(() => {
  // Cargar usuarios iniciales
  searchUsuarios('')
})
</script>

<style scoped>
.recibo-form {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.detalle-card {
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.detalle-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.subtotal-input :deep(.el-input__wrapper) {
  background-color: #f9fafb;
  font-weight: 600;
  color: #059669;
}

.total-section {
  border: 2px solid #d1fae5;
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
}

.form-actions {
  background-color: #fafafa;
  margin: 1.5rem -1.5rem -1.5rem -1.5rem;
  padding: 1rem 1.5rem;
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

.detalle-card {
  animation: slideInUp 0.3s ease-out;
}

/* Responsive */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
    space-y: 0.75rem;
  }
  
  .form-actions .el-button {
    width: 100%;
  }
}
</style>