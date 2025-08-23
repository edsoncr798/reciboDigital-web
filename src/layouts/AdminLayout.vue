<template>
  <div class="admin-layout h-screen flex">
    <!-- Sidebar -->
    <el-aside 
      :width="sidebarCollapsed ? '64px' : '256px'" 
      class="sidebar transition-all duration-300 bg-gray-800 text-white"
    >
      <div class="sidebar-header h-16 flex items-center justify-center border-b border-gray-700">
        <div v-if="!sidebarCollapsed" class="flex items-center space-x-2">
          <el-icon class="text-blue-400 text-2xl"><Document /></el-icon>
          <span class="font-bold text-lg">MisComprobantes</span>
        </div>
        <el-icon v-else class="text-blue-400 text-2xl"><Document /></el-icon>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu border-none bg-transparent"
        :collapse="sidebarCollapsed"
        text-color="#e5e7eb"
        active-text-color="#3b82f6"
        background-color="transparent"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <template #title>Dashboard</template>
        </el-menu-item>
        
        <el-menu-item index="/recibos">
          <el-icon><Document /></el-icon>
          <template #title>Gestión de Recibos</template>
        </el-menu-item>
        
        <el-menu-item index="/usuarios">
          <el-icon><User /></el-icon>
          <template #title>Gestión de Usuarios</template>
        </el-menu-item>
        
        <el-menu-item index="/reportes">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>Reportes y Analytics</template>
        </el-menu-item>
        
        <el-menu-item index="/configuracion" v-if="auth.isAdmin.value">
          <el-icon><Setting /></el-icon>
          <template #title>Configuración</template>
        </el-menu-item>
        
        <el-menu-item index="/auditoria">
          <el-icon><View /></el-icon>
          <template #title>Auditoría y Logs</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- Main Content -->
    <div class="main-content flex-1 flex flex-col">
      <!-- Header -->
      <el-header class="header bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        <div class="header-left flex items-center space-x-4">
          <el-button 
            type="text" 
            @click="toggleSidebar"
            class="text-gray-600 hover:text-gray-800"
          >
            <el-icon class="text-xl"><Expand v-if="sidebarCollapsed" /><Fold v-else /></el-icon>
          </el-button>
          
          <el-breadcrumb separator="/" class="text-gray-600">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right flex items-center space-x-4">
          <!-- Notificaciones -->
          <el-badge :value="notificationCount" :hidden="notificationCount === 0">
            <el-button type="text" class="text-gray-600 hover:text-gray-800">
              <el-icon class="text-xl"><Bell /></el-icon>
            </el-button>
          </el-badge>
          
          <!-- Perfil de usuario -->
          <el-dropdown @command="handleUserCommand">
            <div class="user-profile flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg">
              <el-avatar :size="32" class="bg-blue-500">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="user-info text-sm">
                <div class="font-medium text-gray-800">{{ auth.userProfile.value?.nombreCompleto }}</div>
                <div class="text-gray-500 capitalize">{{ auth.userRole.value }}</div>
              </div>
              <el-icon class="text-gray-400"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  Mi Perfil
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  Cerrar Sesión
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- Page Content -->
      <el-main class="page-content bg-gray-50 p-6 overflow-auto">
        <router-view />
      </el-main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { 
  Document, 
  Odometer, 
  User, 
  DataAnalysis, 
  Setting, 
  View, 
  Expand, 
  Fold, 
  Bell, 
  ArrowDown, 
  SwitchButton 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const auth = useAuth()

// Estado del sidebar
const sidebarCollapsed = ref(false)
const notificationCount = ref(3) // Mock data

// Menu activo basado en la ruta actual
const activeMenu = computed(() => {
  return route.path
})

// Breadcrumbs dinámicos
const breadcrumbs = computed(() => {
  const pathSegments = route.path.split('/').filter(Boolean)
  const breadcrumbMap: Record<string, string> = {
    'dashboard': 'Dashboard',
    'recibos': 'Gestión de Recibos',
    'usuarios': 'Gestión de Usuarios',
    'reportes': 'Reportes y Analytics',
    'configuracion': 'Configuración',
    'auditoria': 'Auditoría y Logs',
    'analytics': 'Analytics'
  }
  
  return pathSegments.map((segment, index) => ({
    title: breadcrumbMap[segment] || segment,
    path: '/' + pathSegments.slice(0, index + 1).join('/')
  }))
})

// Métodos
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const handleMenuSelect = (index: string) => {
  router.push(index)
}

const handleUserCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/perfil')
      break
    case 'logout':
      try {
        await auth.logout()
        ElMessage.success('Sesión cerrada correctamente')
        router.push('/login')
      } catch (error) {
        ElMessage.error('Error al cerrar sesión')
      }
      break
  }
}

onMounted(() => {
  // Inicializar cualquier configuración necesaria
})
</script>

<style scoped>
.admin-layout {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.sidebar {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar-menu {
  border: none !important;
}

.sidebar-menu .el-menu-item {
  border-radius: 8px;
  margin: 4px 8px;
  transition: all 0.3s ease;
}

.sidebar-menu .el-menu-item:hover {
  background-color: rgba(59, 130, 246, 0.1) !important;
  color: #3b82f6 !important;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: rgba(59, 130, 246, 0.15) !important;
  color: #3b82f6 !important;
  font-weight: 600;
}

.header {
  height: 64px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.user-profile {
  transition: all 0.2s ease;
}

.page-content {
  min-height: calc(100vh - 64px);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 1000;
    height: 100vh;
  }
  
  .main-content {
    margin-left: 0;
  }
}
</style>