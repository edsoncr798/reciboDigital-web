import { ref, computed, reactive } from 'vue'
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  DocumentSnapshot,
  QueryConstraint
} from 'firebase/firestore'
import { 
  createUserWithEmailAndPassword, 
  updatePassword,
  deleteUser
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { db, auth } from '@/lib/firebase'
import type { 
  UserProfile, 
  CreateUserProfile, 
  UserFilters, 
  UserRole, 
  UserStatus, 
  UserPermissions,
  PaginatedResponse,
  ApiResponse
} from '@/lib/database.types'
import { useAuth } from './useAuth'

// Estado global del composable
const users = ref<UserProfile[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const currentUser = ref<UserProfile | null>(null)
const totalUsers = ref(0)
const lastDoc = ref<DocumentSnapshot | null>(null)

// Configuración de permisos por rol
const rolePermissions: Record<UserRole, UserPermissions> = {
  super_admin: {
    gestionRecibos: true,
    gestionUsuarios: true,
    reportesAvanzados: true,
    configuracionSistema: true,
    auditoria: true,
    crearAdministradores: true
  },
  admin: {
    gestionRecibos: true,
    gestionUsuarios: true,
    reportesAvanzados: false,
    configuracionSistema: false,
    auditoria: true,
    crearAdministradores: false
  },
  auditor: {
    gestionRecibos: false,
    gestionUsuarios: false,
    reportesAvanzados: false,
    configuracionSistema: false,
    auditoria: true,
    crearAdministradores: false
  }
}

export function useUserProfile() {
  const { user: authUser } = useAuth()

  // Función para obtener permisos por rol
  const getPermissionsByRole = (role: UserRole): UserPermissions => {
    return { ...rolePermissions[role] }
  }

  // Función para verificar si el usuario actual tiene un permiso específico
  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!currentUser.value) return false
    return currentUser.value.permisos[permission] === true
  }

  // Función para verificar si puede gestionar un usuario específico
  const canManageUser = (targetUser: UserProfile): boolean => {
    if (!currentUser.value) return false
    
    // Super admin puede gestionar a todos
    if (currentUser.value.rol === 'super_admin') return true
    
    // Admin puede gestionar auditores
    if (currentUser.value.rol === 'admin' && targetUser.rol === 'auditor') return true
    
    // No puede gestionar usuarios del mismo nivel o superior
    return false
  }

  // Obtener perfil del usuario actual
  const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
    if (!authUser.value) return null
    
    try {
      loading.value = true
      const userDoc = await getDoc(doc(db, 'userProfile', authUser.value.uid))
      
      if (userDoc.exists()) {
        const userData = { uid: userDoc.id, ...userDoc.data() } as UserProfile
        currentUser.value = userData
        return userData
      }
      
      return null
    } catch (err) {
      console.error('Error al obtener perfil del usuario:', err)
      error.value = 'Error al cargar el perfil del usuario'
      return null
    } finally {
      loading.value = false
    }
  }

  // Obtener lista de usuarios con filtros y paginación
  const getUsers = async (
    filters: UserFilters = {}, 
    pageSize: number = 20,
    loadMore: boolean = false
  ): Promise<PaginatedResponse<UserProfile>> => {
    try {
      loading.value = true
      error.value = null

      const constraints: QueryConstraint[] = []
      
      // Aplicar filtros
      if (filters.rol) {
        constraints.push(where('rol', '==', filters.rol))
      }
      
      if (filters.estado) {
        constraints.push(where('estado', '==', filters.estado))
      }
      
      if (filters.departamento) {
        constraints.push(where('departamento', '==', filters.departamento))
      }
      
      if (filters.fechaDesde) {
        constraints.push(where('fechaCreacion', '>=', filters.fechaDesde))
      }
      
      if (filters.fechaHasta) {
        constraints.push(where('fechaCreacion', '<=', filters.fechaHasta))
      }

      // Ordenar por fecha de creación
      constraints.push(orderBy('fechaCreacion', 'desc'))
      
      // Paginación
      if (loadMore && lastDoc.value) {
        constraints.push(startAfter(lastDoc.value))
      }
      
      constraints.push(limit(pageSize))

      const q = query(collection(db, 'userProfile'), ...constraints)
      const querySnapshot = await getDocs(q)
      
      const newUsers = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserProfile[]

      // Filtro de búsqueda en el cliente (para campos de texto)
      let filteredUsers = newUsers
      if (filters.busqueda) {
        const searchTerm = filters.busqueda.toLowerCase()
        filteredUsers = newUsers.filter(user => 
          user.nombreCompleto.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          (user.telefono && user.telefono.includes(searchTerm))
        )
      }

      if (loadMore) {
        users.value = [...users.value, ...filteredUsers]
      } else {
        users.value = filteredUsers
      }

      // Actualizar último documento para paginación
      if (querySnapshot.docs.length > 0) {
        lastDoc.value = querySnapshot.docs[querySnapshot.docs.length - 1]
      }

      const hasMore = querySnapshot.docs.length === pageSize
      
      return {
        data: filteredUsers,
        total: users.value.length,
        page: loadMore ? Math.ceil(users.value.length / pageSize) : 1,
        limit: pageSize,
        hasMore
      }
    } catch (err) {
      console.error('Error al obtener usuarios:', err)
      error.value = 'Error al cargar la lista de usuarios'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener usuario por ID
  const getUserById = async (uid: string): Promise<UserProfile | null> => {
    try {
      loading.value = true
      const userDoc = await getDoc(doc(db, 'userProfile', uid))
      
      if (userDoc.exists()) {
        return { uid: userDoc.id, ...userDoc.data() } as UserProfile
      }
      
      return null
    } catch (err) {
      console.error('Error al obtener usuario:', err)
      error.value = 'Error al cargar el usuario'
      return null
    } finally {
      loading.value = false
    }
  }

  // Crear primer usuario Super Admin (sin validaciones de permisos)
  const createFirstAdmin = async (userData: CreateUserProfile): Promise<ApiResponse<UserProfile>> => {
    try {
      loading.value = true
      error.value = null

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      )
      
      const newUser = userCredential.user

      // Crear perfil en Firestore (forzar rol super_admin)
      const userProfile: Omit<UserProfile, 'uid'> = {
        email: userData.email,
        nombreCompleto: userData.nombreCompleto,
        telefono: userData.telefono || '',
        rol: 'super_admin', // Forzar super_admin para el primer usuario
        estado: 'activo',
        permisos: getPermissionsByRole('super_admin'),
        fechaCreacion: new Date().toISOString(),
        creadoPor: 'sistema',
        configuraciones: {
          notificaciones: true,
          tema: 'claro',
          idioma: 'es'
        },
        departamento: userData.departamento,
        notas: userData.notas
      }

      await addDoc(collection(db, 'userProfile'), {
        ...userProfile,
        uid: newUser.uid
      })

      const createdUser: UserProfile = {
        uid: newUser.uid,
        ...userProfile
      }

      // Agregar a la lista local
      users.value.unshift(createdUser)
      totalUsers.value += 1

      return {
        success: true,
        data: createdUser,
        message: 'Primer Super Administrador creado exitosamente'
      }
    } catch (err: any) {
      console.error('Error al crear primer admin:', err)
      const errorMessage = err.code === 'auth/email-already-in-use' 
        ? 'El email ya está en uso' 
        : 'Error al crear el primer administrador'
      
      error.value = errorMessage
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  // Crear nuevo usuario
  const createUser = async (userData: CreateUserProfile): Promise<ApiResponse<UserProfile>> => {
    try {
      loading.value = true
      error.value = null

      // Verificar permisos
      if (!hasPermission('gestionUsuarios')) {
        throw new Error('No tienes permisos para crear usuarios')
      }

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      )
      
      const newUser = userCredential.user

      // Crear perfil en Firestore
      const userProfile: Omit<UserProfile, 'uid'> = {
        email: userData.email,
        nombreCompleto: userData.nombreCompleto,
        telefono: userData.telefono || '',
        rol: userData.rol,
        estado: 'activo',
        permisos: getPermissionsByRole(userData.rol),
        fechaCreacion: new Date().toISOString(),
        creadoPor: authUser.value?.uid || 'sistema',
        configuraciones: {
          notificaciones: true,
          tema: 'claro',
          idioma: 'es'
        },
        departamento: userData.departamento,
        notas: userData.notas
      }

      await addDoc(collection(db, 'userProfile'), {
        ...userProfile,
        uid: newUser.uid
      })

      const createdUser: UserProfile = {
        uid: newUser.uid,
        ...userProfile
      }

      // Agregar a la lista local
      users.value.unshift(createdUser)
      totalUsers.value += 1

      return {
        success: true,
        data: createdUser,
        message: 'Usuario creado exitosamente'
      }
    } catch (err: any) {
      console.error('Error al crear usuario:', err)
      const errorMessage = err.code === 'auth/email-already-in-use' 
        ? 'El email ya está en uso' 
        : 'Error al crear el usuario'
      
      error.value = errorMessage
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  // Actualizar usuario
  const updateUser = async (uid: string, updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> => {
    try {
      loading.value = true
      error.value = null

      // Verificar permisos
      if (!hasPermission('gestionUsuarios')) {
        throw new Error('No tienes permisos para actualizar usuarios')
      }

      const userToUpdate = await getUserById(uid)
      if (!userToUpdate) {
        throw new Error('Usuario no encontrado')
      }

      if (!canManageUser(userToUpdate)) {
        throw new Error('No tienes permisos para gestionar este usuario')
      }

      // Si se cambia el rol, actualizar permisos
      if (updates.rol && updates.rol !== userToUpdate.rol) {
        updates.permisos = getPermissionsByRole(updates.rol)
      }

      // Actualizar en Firestore
      await updateDoc(doc(db, 'userProfile', uid), {
        ...updates,
        fechaModificacion: new Date().toISOString(),
        modificadoPor: authUser.value?.uid
      })

      // Actualizar en la lista local
      const index = users.value.findIndex(user => user.uid === uid)
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...updates }
      }

      const updatedUser = { ...userToUpdate, ...updates }

      return {
        success: true,
        data: updatedUser,
        message: 'Usuario actualizado exitosamente'
      }
    } catch (err: any) {
      console.error('Error al actualizar usuario:', err)
      error.value = err.message || 'Error al actualizar el usuario'
      return {
        success: false,
        error: error.value
      }
    } finally {
      loading.value = false
    }
  }

  // Cambiar estado del usuario
  const changeUserStatus = async (uid: string, newStatus: UserStatus): Promise<ApiResponse<boolean>> => {
    try {
      loading.value = true
      
      const result = await updateUser(uid, { estado: newStatus })
      
      return {
        success: result.success,
        data: result.success,
        message: `Usuario ${newStatus === 'activo' ? 'activado' : newStatus === 'suspendido' ? 'suspendido' : 'desactivado'} exitosamente`
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Error al cambiar el estado del usuario'
      }
    } finally {
      loading.value = false
    }
  }

  // Eliminar usuario
  const deleteUserProfile = async (uid: string): Promise<ApiResponse<boolean>> => {
    try {
      loading.value = true
      error.value = null

      // Verificar permisos
      if (!hasPermission('gestionUsuarios')) {
        throw new Error('No tienes permisos para eliminar usuarios')
      }

      const userToDelete = await getUserById(uid)
      if (!userToDelete) {
        throw new Error('Usuario no encontrado')
      }

      if (!canManageUser(userToDelete)) {
        throw new Error('No tienes permisos para eliminar este usuario')
      }

      // Eliminar de Firestore
      await deleteDoc(doc(db, 'userProfile', uid))

      // Eliminar de la lista local
      users.value = users.value.filter(user => user.uid !== uid)
      totalUsers.value -= 1

      return {
        success: true,
        data: true,
        message: 'Usuario eliminado exitosamente'
      }
    } catch (err: any) {
      console.error('Error al eliminar usuario:', err)
      error.value = err.message || 'Error al eliminar el usuario'
      return {
        success: false,
        error: error.value
      }
    } finally {
      loading.value = false
    }
  }

  // Obtener estadísticas de usuarios
  const getUserStats = computed(() => {
    const total = users.value.length
    const activos = users.value.filter(user => user.estado === 'activo').length
    const inactivos = users.value.filter(user => user.estado === 'inactivo').length
    const suspendidos = users.value.filter(user => user.estado === 'suspendido').length
    
    const porRol = {
      super_admin: users.value.filter(user => user.rol === 'super_admin').length,
      admin: users.value.filter(user => user.rol === 'admin').length,
      auditor: users.value.filter(user => user.rol === 'auditor').length
    }

    return {
      total,
      activos,
      inactivos,
      suspendidos,
      porRol
    }
  })

  // Limpiar estado
  const clearUsers = () => {
    users.value = []
    lastDoc.value = null
    error.value = null
  }

  return {
    // Estado
    users: computed(() => users.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    currentUser: computed(() => currentUser.value),
    totalUsers: computed(() => totalUsers.value),
    userStats: getUserStats,

    // Métodos
    getCurrentUserProfile,
    getUsers,
    getUserById,
    createUser,
    createFirstAdmin,
    updateUser,
    changeUserStatus,
    deleteUserProfile,
    clearUsers,
    
    // Utilidades
    hasPermission,
    canManageUser,
    getPermissionsByRole,
    rolePermissions: computed(() => rolePermissions)
  }
}