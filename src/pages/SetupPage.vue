<template>
  <div class="setup-page min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
    <div class="setup-container bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full">
      <!-- Header -->
      <div class="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white text-center">
        <div class="flex items-center justify-center mb-4">
          <el-icon class="text-4xl mr-3"><Setting /></el-icon>
          <h1 class="text-3xl font-bold">MisComprobantes</h1>
        </div>
        <h2 class="text-xl font-semibold mb-2">Configuración Inicial</h2>
        <p class="text-indigo-100">
          Bienvenido al panel administrativo. Para comenzar, necesitas crear el primer usuario Super Administrador.
        </p>
      </div>

      <!-- Formulario -->
      <div class="p-8">
        <div class="mb-6">
          <el-alert
            title="Primer Usuario del Sistema"
            type="info"
            :closable="false"
            class="mb-6"
          >
            <template #default>
              <p class="text-sm">
                Este será el usuario principal con acceso completo al sistema. 
                Podrás crear más administradores después de completar esta configuración.
              </p>
            </template>
          </el-alert>
        </div>

        <el-form 
          ref="setupFormRef" 
          :model="setupForm" 
          :rules="setupRules" 
          label-position="top"
          class="space-y-6"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <el-form-item label="Nombre Completo" prop="nombreCompleto">
              <el-input
                v-model="setupForm.nombreCompleto"
                placeholder="Ej: Juan Pérez"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item label="Correo Electrónico" prop="email">
              <el-input
                v-model="setupForm.email"
                type="email"
                placeholder="admin@miscomprobantes.com"
                size="large"
                :prefix-icon="Message"
              />
            </el-form-item>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <el-form-item label="Contraseña" prop="password">
              <el-input
                v-model="setupForm.password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                size="large"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item label="Confirmar Contraseña" prop="confirmarPassword">
              <el-input
                v-model="setupForm.confirmarPassword"
                type="password"
                placeholder="Confirma tu contraseña"
                size="large"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <el-form-item label="Teléfono (Opcional)" prop="telefono">
              <el-input
                v-model="setupForm.telefono"
                placeholder="+52 55 1234 5678"
                size="large"
                :prefix-icon="Phone"
              />
            </el-form-item>
            
            <el-form-item label="Departamento (Opcional)" prop="departamento">
              <el-select 
                v-model="setupForm.departamento" 
                placeholder="Selecciona departamento" 
                size="large"
                style="width: 100%"
                clearable
              >
                <el-option label="Administración" value="Administración" />
                <el-option label="Sistemas" value="Sistemas" />
                <el-option label="Dirección General" value="Dirección General" />
                <el-option label="Finanzas" value="Finanzas" />
              </el-select>
            </el-form-item>
          </div>

          <!-- Información del rol -->
          <div class="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200">
            <h3 class="text-lg font-semibold text-purple-800 mb-3 flex items-center">
              <el-icon class="mr-2"><Star /></el-icon>
              Permisos de Super Administrador
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div class="flex items-center text-purple-700">
                <el-icon class="text-green-500 mr-2"><Check /></el-icon>
                Gestión completa de recibos
              </div>
              <div class="flex items-center text-purple-700">
                <el-icon class="text-green-500 mr-2"><Check /></el-icon>
                Administración de usuarios
              </div>
              <div class="flex items-center text-purple-700">
                <el-icon class="text-green-500 mr-2"><Check /></el-icon>
                Reportes avanzados
              </div>
              <div class="flex items-center text-purple-700">
                <el-icon class="text-green-500 mr-2"><Check /></el-icon>
                Configuración del sistema
              </div>
              <div class="flex items-center text-purple-700">
                <el-icon class="text-green-500 mr-2"><Check /></el-icon>
                Auditoría completa
              </div>
              <div class="flex items-center text-purple-700">
                <el-icon class="text-green-500 mr-2"><Check /></el-icon>
                Crear administradores
              </div>
            </div>
          </div>

          <!-- Error message -->
          <el-alert
            v-if="error"
            :title="error"
            type="error"
            :closable="false"
            class="mt-4"
          />

          <!-- Botón de crear -->
          <div class="flex justify-center pt-6">
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleCreateSuperAdmin"
              class="px-12 py-3 text-lg font-semibold"
            >
              <span v-if="!loading">Crear Super Administrador</span>
              <span v-else>Creando usuario...</span>
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { 
  Setting, 
  User, 
  Message, 
  Lock, 
  Phone, 
  Check,
  Star
} from '@element-plus/icons-vue'
import { useUserProfile } from '@/composables/useUserProfile'
import { useSystemSetup } from '@/composables/useSystemSetup'
import type { CreateUserProfile } from '@/lib/database.types'

const router = useRouter()
const { createFirstAdmin } = useUserProfile()
const { markSystemAsInitialized } = useSystemSetup()

// Referencias
const setupFormRef = ref<FormInstance>()
const loading = ref(false)
const error = ref<string | null>(null)

// Formulario de configuración
const setupForm = reactive({
  nombreCompleto: '',
  email: '',
  password: '',
  confirmarPassword: '',
  telefono: '',
  departamento: ''
})

// Reglas de validación
const setupRules: FormRules = {
  nombreCompleto: [
    { required: true, message: 'El nombre completo es requerido', trigger: 'blur' },
    { min: 2, max: 100, message: 'El nombre debe tener entre 2 y 100 caracteres', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'El correo electrónico es requerido', trigger: 'blur' },
    { type: 'email', message: 'Ingresa un correo electrónico válido', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'La contraseña es requerida', trigger: 'blur' },
    { min: 8, message: 'La contraseña debe tener al menos 8 caracteres', trigger: 'blur' },
    { 
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número', 
      trigger: 'blur' 
    }
  ],
  confirmarPassword: [
    { required: true, message: 'Confirma tu contraseña', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== setupForm.password) {
          callback(new Error('Las contraseñas no coinciden'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

// Crear el primer Super Administrador
const handleCreateSuperAdmin = async () => {
  if (!setupFormRef.value) return
  
  try {
    const valid = await setupFormRef.value.validate()
    if (!valid) return
    
    loading.value = true
    error.value = null
    
    // Crear el usuario Super Admin
    const newUserData: CreateUserProfile = {
      email: setupForm.email,
      nombreCompleto: setupForm.nombreCompleto,
      telefono: setupForm.telefono || undefined,
      rol: 'super_admin',
      departamento: setupForm.departamento || undefined,
      notas: 'Primer usuario del sistema - Super Administrador',
      password: setupForm.password
    }
    
    const result = await createFirstAdmin(newUserData)
    
    if (result.success) {
      // Marcar el sistema como inicializado
      markSystemAsInitialized()
      
      ElMessage.success({
        message: '¡Super Administrador creado exitosamente!',
        duration: 3000
      })
      
      // Redirigir al login después de un breve delay
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      error.value = result.error || 'Error al crear el Super Administrador'
      ElMessage.error(error.value)
    }
  } catch (err: any) {
    error.value = 'Error inesperado al crear el usuario'
    ElMessage.error(error.value)
    console.error('Error en configuración inicial:', err)
  } finally {
    loading.value = false
  }
}

// Verificar si ya hay usuarios al montar el componente
onMounted(async () => {
  const { checkSystemInitialization } = useSystemSetup()
  const isInitialized = await checkSystemInitialization()
  
  if (isInitialized) {
    ElMessage.info('El sistema ya está configurado')
    router.push('/login')
  }
})
</script>

<style scoped>
.setup-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.setup-container {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #374151;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  border-color: #6366f1;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
}

@media (max-width: 768px) {
  .setup-container {
    margin: 1rem;
  }
}
</style>