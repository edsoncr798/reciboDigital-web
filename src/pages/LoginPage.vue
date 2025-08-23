<template>
  <div class="login-page min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="login-container bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full">
      <div class="flex min-h-[600px]">
        <!-- Panel izquierdo - Branding -->
        <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-center text-white">
          <div class="mb-8">
            <div class="flex items-center space-x-3 mb-6">
              <el-icon class="text-4xl"><Document /></el-icon>
              <h1 class="text-3xl font-bold">MisComprobantes</h1>
            </div>
            <h2 class="text-xl font-semibold mb-4">Panel Administrativo</h2>
            <p class="text-blue-100 text-lg leading-relaxed">
              Sistema de gestión y supervisión de recibos digitales. 
              Acceso exclusivo para administradores autorizados.
            </p>
          </div>
          
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <el-icon class="text-xl"><Lock /></el-icon>
              <span>Autenticación segura</span>
            </div>
            <div class="flex items-center space-x-3">
              <el-icon class="text-xl"><DataAnalysis /></el-icon>
              <span>Reportes en tiempo real</span>
            </div>
            <div class="flex items-center space-x-3">
              <el-icon class="text-xl"><View /></el-icon>
              <span>Auditoría completa</span>
            </div>
          </div>
        </div>
        
        <!-- Panel derecho - Formulario de login -->
        <div class="w-full lg:w-1/2 p-12 flex flex-col justify-center">
          <div class="max-w-sm mx-auto w-full">
            <!-- Header móvil -->
            <div class="lg:hidden text-center mb-8">
              <div class="flex items-center justify-center space-x-2 mb-4">
                <el-icon class="text-3xl text-blue-600"><Document /></el-icon>
                <h1 class="text-2xl font-bold text-gray-800">MisComprobantes</h1>
              </div>
              <p class="text-gray-600">Panel Administrativo</p>
            </div>
            
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-gray-800 mb-2">Iniciar Sesión</h2>
              <p class="text-gray-600">Ingresa tus credenciales para acceder al panel</p>
            </div>
            
            <el-form 
              ref="loginFormRef" 
              :model="loginForm" 
              :rules="loginRules" 
              @submit.prevent="handleLogin"
              class="space-y-6"
            >
              <el-form-item prop="email">
                <el-input
                  v-model="loginForm.email"
                  type="email"
                  placeholder="Correo electrónico"
                  size="large"
                  :prefix-icon="Message"
                  class="login-input"
                />
              </el-form-item>
              
              <el-form-item prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="Contraseña"
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                  class="login-input"
                  @keyup.enter="handleLogin"
                />
              </el-form-item>
              
              <div class="flex items-center justify-between mb-6">
                <el-checkbox v-model="loginForm.remember" class="text-gray-600">
                  Recordar sesión
                </el-checkbox>
                <el-button type="text" class="text-blue-600 hover:text-blue-700">
                  ¿Olvidaste tu contraseña?
                </el-button>
              </div>
              
              <el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  :loading="auth.loading.value"
                  @click="handleLogin"
                  class="w-full login-button"
                >
                  <span v-if="!auth.loading.value">Iniciar Sesión</span>
                  <span v-else>Iniciando sesión...</span>
                </el-button>
              </el-form-item>
            </el-form>
            
            <!-- Error message -->
            <el-alert
              v-if="auth.error.value"
              :title="auth.error.value"
              type="error"
              :closable="false"
              class="mt-4"
            />
            
            <!-- Demo credentials -->
            <div class="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">Credenciales de prueba:</h4>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div class="text-xs text-gray-600">
                    <div class="font-medium text-gray-800">Administrador</div>
                    <div>admin@miscomprobantes.com</div>
                  </div>
                  <el-button 
                    size="small" 
                    type="primary" 
                    @click="loadDemoCredentials('admin')"
                    class="demo-btn"
                  >
                    Usar
                  </el-button>
                </div>
                
                <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div class="text-xs text-gray-600">
                    <div class="font-medium text-gray-800">Auditor</div>
                    <div>auditor@miscomprobantes.com</div>
                  </div>
                  <el-button 
                    size="small" 
                    type="info" 
                    @click="loadDemoCredentials('auditor')"
                    class="demo-btn"
                  >
                    Usar
                  </el-button>
                </div>
                
                <div class="text-xs text-gray-500 text-center mt-2">
                  <strong>Contraseña para ambos:</strong> password123
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Document, DataAnalysis, View, Message, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const auth = useAuth()

// Referencias
const loginFormRef = ref<FormInstance>()

// Formulario de login
const loginForm = reactive({
  email: '',
  password: '',
  remember: false
})

// Reglas de validación
const loginRules: FormRules = {
  email: [
    { required: true, message: 'El correo electrónico es requerido', trigger: 'blur' },
    { type: 'email', message: 'Ingresa un correo electrónico válido', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'La contraseña es requerida', trigger: 'blur' },
    { min: 6, message: 'La contraseña debe tener al menos 6 caracteres', trigger: 'blur' }
  ]
}

// Métodos
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return
    
    auth.clearError()
    
    const result = await auth.login(loginForm.email, loginForm.password)
    
    if (result.success) {
      ElMessage.success('¡Bienvenido al panel administrativo!')
      router.push('/dashboard')
    } else {
      ElMessage.error(result.error || 'Error al iniciar sesión')
    }
  } catch (error: any) {
    ElMessage.error('Error inesperado al iniciar sesión')
    console.error('Login error:', error)
  }
}

// Cargar credenciales demo
const loadDemoCredentials = (type: 'admin' | 'auditor') => {
  if (type === 'admin') {
    loginForm.email = 'admin@miscomprobantes.com'
  } else {
    loginForm.email = 'auditor@miscomprobantes.com'
  }
  loginForm.password = 'password123'
}

onMounted(() => {
  // Limpiar errores al montar el componente
  auth.clearError()
})
</script>

<style scoped>
.login-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.login-container {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.login-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
  padding: 12px 16px;
}

.login-input :deep(.el-input__wrapper:hover) {
  border-color: #3b82f6;
}

.login-input :deep(.el-input__wrapper.is-focus) {
  border-color: #1e40af;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}

.login-button {
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(30, 64, 175, 0.3);
}

.login-button:active {
  transform: translateY(0);
}

.demo-btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.demo-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Animaciones */
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

.login-container {
  animation: fadeInUp 0.6s ease-out;
}

/* Responsive */
@media (max-width: 1024px) {
  .login-container {
    margin: 1rem;
  }
}

@media (max-width: 640px) {
  .login-page {
    padding: 1rem;
  }
  
  .login-container {
    margin: 0;
  }
}
</style>