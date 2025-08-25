<template>
  <div class="usuarios-page">
    <div class="page-header">
      <h1 class="text-2xl font-bold text-gray-900">Gestión de Usuarios Administrativos</h1>
      <p class="text-gray-600">Administra los usuarios del panel administrativo</p>
    </div>

    <!-- Estadísticas -->
    <div class="stats-grid grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="stat-card bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Total Usuarios</p>
            <p class="text-2xl font-bold text-blue-600">{{ userStats.total }}</p>
          </div>
          <el-icon class="text-3xl text-blue-500"><User /></el-icon>
        </div>
      </div>
      <div class="stat-card bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Usuarios Activos</p>
            <p class="text-2xl font-bold text-green-600">{{ userStats.activos }}</p>
          </div>
          <el-icon class="text-3xl text-green-500"><Check /></el-icon>
        </div>
      </div>
      <div class="stat-card bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Super Admins</p>
            <p class="text-2xl font-bold text-purple-600">{{ userStats.porRol.super_admin }}</p>
          </div>
          <el-icon class="text-3xl text-purple-500"><Crown /></el-icon>
        </div>
      </div>
      <div class="stat-card bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Auditores</p>
            <p class="text-2xl font-bold text-orange-600">{{ userStats.porRol.auditor }}</p>
          </div>
          <el-icon class="text-3xl text-orange-500"><View /></el-icon>
        </div>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="filters-section bg-white rounded-lg shadow p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <el-input
          v-model="filters.busqueda"
          placeholder="Buscar por nombre, email..."
          prefix-icon="Search"
          clearable
          @input="debouncedSearch"
        />
        <el-select v-model="filters.rol" placeholder="Rol" clearable>
          <el-option label="Super Administrador" value="super_admin" />
          <el-option label="Administrador" value="admin" />
          <el-option label="Auditor" value="auditor" />
        </el-select>
        <el-select v-model="filters.estado" placeholder="Estado" clearable>
          <el-option label="Activo" value="activo" />
          <el-option label="Inactivo" value="inactivo" />
          <el-option label="Suspendido" value="suspendido" />
        </el-select>
        <el-select v-model="filters.departamento" placeholder="Departamento" clearable>
          <el-option label="Administración" value="Administración" />
          <el-option label="Finanzas" value="Finanzas" />
          <el-option label="Auditoría" value="Auditoría" />
          <el-option label="Sistemas" value="Sistemas" />
        </el-select>
        <el-button type="primary" @click="loadUsers" :loading="loading">
          <el-icon><Search /></el-icon>
          Buscar
        </el-button>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div class="users-table bg-white rounded-lg shadow">
      <div class="table-header p-6 border-b">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">Lista de Usuarios Administrativos</h2>
          <div class="flex gap-2">
            <el-button @click="exportUsers" :disabled="users.length === 0">
              <el-icon><Download /></el-icon>
              Exportar
            </el-button>
            <el-button 
              type="primary" 
              @click="openCreateDialog"
              :disabled="!hasPermission('gestionUsuarios')"
            >
              <el-icon><Plus /></el-icon>
              Nuevo Usuario
            </el-button>
          </div>
        </div>
      </div>

      <el-table
        :data="users"
        style="width: 100%"
        v-loading="loading"
        empty-text="No hay usuarios para mostrar"
      >
        <el-table-column prop="nombreCompleto" label="Usuario" min-width="250">
          <template #default="{ row }">
            <div class="flex items-center gap-3">
              <el-avatar :size="40" :src="row.avatar">
                {{ row.nombreCompleto.charAt(0).toUpperCase() }}
              </el-avatar>
              <div>
                <div class="font-medium text-gray-900">{{ row.nombreCompleto }}</div>
                <div class="text-sm text-gray-500">{{ row.email }}</div>
                <div class="text-xs text-gray-400" v-if="row.departamento">
                  {{ row.departamento }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="rol" label="Rol" width="150">
          <template #default="{ row }">
            <el-tag
              :type="getRoleType(row.rol)"
              size="small"
            >
              {{ getRoleLabel(row.rol) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="estado" label="Estado" width="120">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.estado)"
              size="small"
            >
              {{ getStatusLabel(row.estado) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="telefono" label="Teléfono" width="150">
          <template #default="{ row }">
            {{ row.telefono || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="fechaCreacion" label="Fecha Creación" width="150">
          <template #default="{ row }">
            {{ formatDateTimePeru(row.fechaCreacion) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="fechaUltimoAcceso" label="Último Acceso" width="150">
          <template #default="{ row }">
            {{ row.fechaUltimoAcceso ? formatDateTimePeru(row.fechaUltimoAcceso) : 'Nunca' }}
          </template>
        </el-table-column>
        
        <el-table-column label="Acciones" width="200" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2">
              <el-button
                size="small"
                @click="viewUser(row)"
                title="Ver detalles"
              >
                <el-icon><View /></el-icon>
              </el-button>
              <el-button
                size="small"
                type="primary"
                @click="editUser(row)"
                :disabled="!canManageUser(row)"
                title="Editar usuario"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-dropdown @command="handleUserAction" :disabled="!canManageUser(row)">
                <el-button size="small" title="Más acciones">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item 
                      :command="{ action: row.estado === 'activo' ? 'suspend' : 'activate', user: row }"
                    >
                      {{ row.estado === 'activo' ? 'Suspender' : 'Activar' }}
                    </el-dropdown-item>
                    <el-dropdown-item 
                      :command="{ action: 'delete', user: row }" 
                      divided
                      :disabled="row.rol === 'super_admin'"
                    >
                      Eliminar
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Paginación -->
      <div class="pagination-container p-6 border-t" v-if="users.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalUsers"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- Dialog para crear/editar usuario -->
    <el-dialog
      v-model="showUserDialog"
      :title="isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'"
      width="700px"
      :before-close="handleCloseDialog"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="140px"
        class="user-form"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <el-form-item label="Nombre Completo" prop="nombreCompleto">
            <el-input v-model="userForm.nombreCompleto" placeholder="Ingresa el nombre completo" />
          </el-form-item>
          
          <el-form-item label="Email" prop="email">
            <el-input 
              v-model="userForm.email" 
              type="email" 
              placeholder="usuario@ejemplo.com"
              :disabled="isEditing"
            />
          </el-form-item>
          
          <el-form-item label="Teléfono" prop="telefono">
            <el-input v-model="userForm.telefono" placeholder="+52 55 1234 5678" />
          </el-form-item>
          
          <el-form-item label="Rol" prop="rol">
            <el-select v-model="userForm.rol" placeholder="Selecciona un rol" style="width: 100%">
              <el-option 
                v-for="role in availableRoles" 
                :key="role.value" 
                :label="role.label" 
                :value="role.value"
                :disabled="!canAssignRole(role.value as UserRole)"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="Departamento" prop="departamento">
            <el-select v-model="userForm.departamento" placeholder="Selecciona departamento" style="width: 100%" clearable>
              <el-option label="Administración" value="Administración" />
              <el-option label="Finanzas" value="Finanzas" />
              <el-option label="Auditoría" value="Auditoría" />
              <el-option label="Sistemas" value="Sistemas" />
              <el-option label="Recursos Humanos" value="Recursos Humanos" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="Estado" prop="estado" v-if="isEditing">
            <el-select v-model="userForm.estado" placeholder="Estado del usuario" style="width: 100%">
              <el-option label="Activo" value="activo" />
              <el-option label="Inactivo" value="inactivo" />
              <el-option label="Suspendido" value="suspendido" />
            </el-select>
          </el-form-item>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4" v-if="!isEditing">
          <el-form-item label="Contraseña" prop="password">
            <el-input 
              v-model="userForm.password" 
              type="password" 
              placeholder="Mínimo 6 caracteres"
              show-password
            />
          </el-form-item>
          
          <el-form-item label="Confirmar Contraseña" prop="confirmarPassword">
            <el-input 
              v-model="userForm.confirmarPassword" 
              type="password" 
              placeholder="Confirma la contraseña"
              show-password
            />
          </el-form-item>
        </div>
        
        <el-form-item label="Notas" prop="notas">
          <el-input 
            v-model="userForm.notas" 
            type="textarea" 
            :rows="3" 
            placeholder="Notas adicionales sobre el usuario (opcional)"
          />
        </el-form-item>
        
        <!-- Mostrar permisos del rol seleccionado -->
        <div v-if="userForm.rol" class="permissions-preview mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Permisos del rol {{ getRoleLabel(userForm.rol) }}:</h4>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="(value, key) in getPermissionsByRole(userForm.rol)" :key="key" class="flex items-center gap-2">
              <el-icon :class="value ? 'text-green-500' : 'text-gray-400'">
                <component :is="value ? 'Check' : 'Close'" />
              </el-icon>
              <span class="text-sm" :class="value ? 'text-gray-700' : 'text-gray-400'">
                {{ getPermissionLabel(key) }}
              </span>
            </div>
          </div>
        </div>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDialog">Cancelar</el-button>
          <el-button 
            type="primary" 
            @click="submitUserForm"
            :loading="loading"
          >
            {{ isEditing ? 'Actualizar' : 'Crear' }} Usuario
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Dialog para ver detalles del usuario -->
    <el-dialog
      v-model="showViewDialog"
      title="Detalles del Usuario"
      width="600px"
    >
      <div v-if="selectedUser" class="user-details">
        <div class="flex items-center gap-4 mb-6">
          <el-avatar :size="80" :src="selectedUser.avatar">
            {{ selectedUser.nombreCompleto.charAt(0).toUpperCase() }}
          </el-avatar>
          <div>
            <h3 class="text-xl font-bold text-gray-900">{{ selectedUser.nombreCompleto }}</h3>
            <p class="text-gray-600">{{ selectedUser.email }}</p>
            <div class="flex gap-2 mt-2">
              <el-tag :type="getRoleType(selectedUser.rol)" size="small">
                {{ getRoleLabel(selectedUser.rol) }}
              </el-tag>
              <el-tag :type="getStatusType(selectedUser.estado)" size="small">
                {{ getStatusLabel(selectedUser.estado) }}
              </el-tag>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium text-gray-700 mb-3">Información Personal</h4>
            <div class="space-y-2">
              <div><span class="text-gray-500">Teléfono:</span> {{ selectedUser.telefono || 'No especificado' }}</div>
              <div><span class="text-gray-500">Departamento:</span> {{ selectedUser.departamento || 'No especificado' }}</div>
              <div><span class="text-gray-500">Fecha de creación:</span> {{ formatDateTimePeru(selectedUser.fechaCreacion) }}</div>
          <div><span class="text-gray-500">Último acceso:</span> {{ selectedUser.fechaUltimoAcceso ? formatDateTimePeru(selectedUser.fechaUltimoAcceso) : 'Nunca' }}</div>
              <div><span class="text-gray-500">Creado por:</span> {{ selectedUser.creadoPor }}</div>
            </div>
          </div>
          
          <div>
            <h4 class="font-medium text-gray-700 mb-3">Permisos</h4>
            <div class="space-y-2">
              <div v-for="(value, key) in selectedUser.permisos" :key="key" class="flex items-center gap-2">
                <el-icon :class="value ? 'text-green-500' : 'text-gray-400'">
                  <component :is="value ? 'Check' : 'Close'" />
                </el-icon>
                <span class="text-sm" :class="value ? 'text-gray-700' : 'text-gray-400'">
                  {{ getPermissionLabel(key) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="selectedUser.notas" class="mt-6">
          <h4 class="font-medium text-gray-700 mb-2">Notas</h4>
          <p class="text-gray-600 bg-gray-50 p-3 rounded">{{ selectedUser.notas }}</p>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showViewDialog = false">Cerrar</el-button>
          <el-button 
            type="primary" 
            @click="editUser(selectedUser)"
            :disabled="!canManageUser(selectedUser)"
          >
            Editar Usuario
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { 
  Plus, 
  User, 
  Search, 
  Download, 
  View, 
  Edit, 
  MoreFilled,
  Check,
  Close,
  Warning
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserProfile } from '@/composables/useUserProfile'
import type { 
  UserProfile, 
  UserForm, 
  UserFilters, 
  UserRole, 
  UserStatus,
  CreateUserProfile
} from '@/lib/database.types'
import { debounce } from 'lodash-es'
import { formatDateTimePeru } from '@/lib/utils'

// Composables
const {
  users,
  loading,
  error,
  currentUser,
  totalUsers,
  userStats,
  getCurrentUserProfile,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  changeUserStatus,
  deleteUserProfile,
  clearUsers,
  hasPermission,
  canManageUser,
  getPermissionsByRole
} = useUserProfile()

// Estado reactivo
const showUserDialog = ref(false)
const showViewDialog = ref(false)
const isEditing = ref(false)
const selectedUser = ref<UserProfile | null>(null)
const userFormRef = ref<FormInstance>()
const currentPage = ref(1)
const pageSize = ref(20)

// Filtros
const filters = ref<UserFilters>({
  busqueda: '',
  rol: undefined,
  estado: undefined,
  departamento: undefined
})

// Formulario de usuario
const userForm = ref<UserForm>({
  email: '',
  nombreCompleto: '',
  telefono: '',
  rol: 'auditor',
  departamento: '',
  notas: '',
  password: '',
  confirmarPassword: ''
})

// Reglas de validación
const userFormRules: FormRules = {
  nombreCompleto: [
    { required: true, message: 'El nombre completo es requerido', trigger: 'blur' },
    { min: 2, max: 100, message: 'El nombre debe tener entre 2 y 100 caracteres', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'El email es requerido', trigger: 'blur' },
    { type: 'email', message: 'Ingresa un email válido', trigger: 'blur' }
  ],
  rol: [
    { required: true, message: 'El rol es requerido', trigger: 'change' }
  ],
  password: [
    { 
      validator: (rule, value, callback) => {
        if (!isEditing.value && (!value || value.length < 6)) {
          callback(new Error('La contraseña debe tener al menos 6 caracteres'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  confirmarPassword: [
    { 
      validator: (rule, value, callback) => {
        if (!isEditing.value && value !== userForm.value.password) {
          callback(new Error('Las contraseñas no coinciden'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

// Roles disponibles según permisos del usuario actual
const availableRoles = computed(() => {
  const roles = [
    { label: 'Auditor', value: 'auditor' },
    { label: 'Administrador', value: 'admin' },
    { label: 'Super Administrador', value: 'super_admin' }
  ]
  
  // Solo super admin puede crear otros super admins
  if (currentUser.value?.rol !== 'super_admin') {
    return roles.filter(role => role.value !== 'super_admin')
  }
  
  return roles
})

// Funciones de utilidad
const getRoleLabel = (role: UserRole): string => {
  const labels = {
    super_admin: 'Super Admin',
    admin: 'Administrador',
    auditor: 'Auditor'
  }
  return labels[role] || role
}

const getRoleType = (role: UserRole): string => {
  const types = {
    super_admin: 'danger',
    admin: 'warning',
    auditor: 'info'
  }
  return types[role] || 'info'
}

const getStatusLabel = (status: UserStatus): string => {
  const labels = {
    activo: 'Activo',
    inactivo: 'Inactivo',
    suspendido: 'Suspendido'
  }
  return labels[status] || status
}

const getStatusType = (status: UserStatus): string => {
  const types = {
    activo: 'success',
    inactivo: 'info',
    suspendido: 'warning'
  }
  return types[status] || 'info'
}

const getPermissionLabel = (permission: string): string => {
  const labels = {
    gestionRecibos: 'Gestión de Recibos',
    gestionUsuarios: 'Gestión de Usuarios',
    reportesAvanzados: 'Reportes Avanzados',
    configuracionSistema: 'Configuración del Sistema',
    auditoria: 'Auditoría',
    crearAdministradores: 'Crear Administradores'
  }
  return labels[permission] || permission
}

// Función de formato de fecha ahora importada desde @/lib/utils

const canAssignRole = (role: UserRole): boolean => {
  if (!currentUser.value) return false
  
  // Super admin puede asignar cualquier rol
  if (currentUser.value.rol === 'super_admin') return true
  
  // Admin puede asignar solo auditor
  if (currentUser.value.rol === 'admin' && role === 'auditor') return true
  
  return false
}

// Búsqueda con debounce
const debouncedSearch = debounce(() => {
  loadUsers()
}, 500)

// Funciones principales
const loadUsers = async () => {
  try {
    await getUsers(filters.value, pageSize.value)
  } catch (err) {
    ElMessage.error('Error al cargar usuarios')
  }
}

const openCreateDialog = () => {
  isEditing.value = false
  selectedUser.value = null
  resetUserForm()
  showUserDialog.value = true
}

const viewUser = (user: UserProfile) => {
  selectedUser.value = user
  showViewDialog.value = true
}

const editUser = (user: UserProfile) => {
  isEditing.value = true
  selectedUser.value = user
  
  // Llenar formulario con datos del usuario
  userForm.value = {
    email: user.email,
    nombreCompleto: user.nombreCompleto,
    telefono: user.telefono || '',
    rol: user.rol,
    departamento: user.departamento || '',
    notas: user.notas || '',
    password: '',
    confirmarPassword: ''
  }
  
  showViewDialog.value = false
  showUserDialog.value = true
}

const resetUserForm = () => {
  userForm.value = {
    email: '',
    nombreCompleto: '',
    telefono: '',
    rol: 'auditor',
    departamento: '',
    notas: '',
    password: '',
    confirmarPassword: ''
  }
  
  nextTick(() => {
    userFormRef.value?.clearValidate()
  })
}

const submitUserForm = async () => {
  if (!userFormRef.value) return
  
  try {
    const valid = await userFormRef.value.validate()
    if (!valid) return
    
    if (isEditing.value && selectedUser.value) {
      // Actualizar usuario
      const updates: Partial<UserProfile> = {
        nombreCompleto: userForm.value.nombreCompleto,
        telefono: userForm.value.telefono,
        rol: userForm.value.rol,
        departamento: userForm.value.departamento,
        notas: userForm.value.notas
      }
      
      const result = await updateUser(selectedUser.value.uid, updates)
      
      if (result.success) {
        ElMessage.success('Usuario actualizado exitosamente')
        showUserDialog.value = false
        await loadUsers()
      } else {
        ElMessage.error(result.error || 'Error al actualizar usuario')
      }
    } else {
      // Crear nuevo usuario
      const newUserData: CreateUserProfile = {
        email: userForm.value.email,
        nombreCompleto: userForm.value.nombreCompleto,
        telefono: userForm.value.telefono,
        rol: userForm.value.rol,
        departamento: userForm.value.departamento,
        notas: userForm.value.notas,
        password: userForm.value.password!
      }
      
      const result = await createUser(newUserData)
      
      if (result.success) {
        ElMessage.success('Usuario creado exitosamente')
        showUserDialog.value = false
        await loadUsers()
      } else {
        ElMessage.error(result.error || 'Error al crear usuario')
      }
    }
  } catch (err) {
    ElMessage.error('Error en el formulario')
  }
}

const handleUserAction = async (command: { action: string; user: UserProfile }) => {
  const { action, user } = command
  
  try {
    switch (action) {
      case 'activate':
        await changeUserStatus(user.uid, 'activo')
        ElMessage.success('Usuario activado')
        await loadUsers()
        break
        
      case 'suspend':
        await changeUserStatus(user.uid, 'suspendido')
        ElMessage.success('Usuario suspendido')
        await loadUsers()
        break
        
      case 'delete':
        await ElMessageBox.confirm(
          `¿Estás seguro de eliminar al usuario "${user.nombreCompleto}"?`,
          'Confirmar eliminación',
          {
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            type: 'warning'
          }
        )
        
        const result = await deleteUserProfile(user.uid)
        if (result.success) {
          ElMessage.success('Usuario eliminado exitosamente')
          await loadUsers()
        } else {
          ElMessage.error(result.error || 'Error al eliminar usuario')
        }
        break
    }
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('Error al procesar la acción')
    }
  }
}

const handleCloseDialog = () => {
  showUserDialog.value = false
  resetUserForm()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadUsers()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadUsers()
}

const exportUsers = () => {
  // Implementar exportación
  ElMessage.info('Función de exportación en desarrollo')
}

// Cargar datos al montar el componente
onMounted(async () => {
  await getCurrentUserProfile()
  await loadUsers()
})
</script>