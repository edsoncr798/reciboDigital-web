import { ref, computed } from 'vue'
import { collection, getDocs, limit, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserProfile } from '@/lib/database.types'

// Estado global del sistema
const isSystemInitialized = ref<boolean | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const totalUsers = ref(0)

export function useSystemSetup() {
  // Verificar si el sistema está inicializado (tiene al menos un usuario)
  const checkSystemInitialization = async (): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null
      
      // Consultar si existe al menos un usuario en userProfile
      const q = query(collection(db, 'userProfile'), limit(1))
      const querySnapshot = await getDocs(q)
      
      const hasUsers = !querySnapshot.empty
      totalUsers.value = querySnapshot.size
      isSystemInitialized.value = hasUsers
      
      console.log(`Sistema inicializado: ${hasUsers}, Total usuarios: ${totalUsers.value}`)
      
      return hasUsers
    } catch (err: any) {
      console.error('Error al verificar inicialización del sistema:', err)
      error.value = 'Error al verificar el estado del sistema'
      isSystemInitialized.value = false
      return false
    } finally {
      loading.value = false
    }
  }

  // Obtener el total de usuarios en el sistema
  const getUserCount = async (): Promise<number> => {
    try {
      const q = query(collection(db, 'userProfile'))
      const querySnapshot = await getDocs(q)
      totalUsers.value = querySnapshot.size
      return querySnapshot.size
    } catch (err) {
      console.error('Error al obtener conteo de usuarios:', err)
      return 0
    }
  }

  // Marcar el sistema como inicializado
  const markSystemAsInitialized = () => {
    isSystemInitialized.value = true
    totalUsers.value = 1
  }

  // Resetear el estado del sistema
  const resetSystemState = () => {
    isSystemInitialized.value = null
    totalUsers.value = 0
    error.value = null
  }

  // Computed para determinar si necesita configuración inicial
  const needsInitialSetup = computed(() => {
    return isSystemInitialized.value === false || totalUsers.value === 0
  })

  // Computed para determinar si está cargando
  const isLoading = computed(() => loading.value)

  // Computed para determinar si hay error
  const hasError = computed(() => error.value !== null)

  return {
    // Estado
    isSystemInitialized: computed(() => isSystemInitialized.value),
    totalUsers: computed(() => totalUsers.value),
    loading: isLoading,
    error: computed(() => error.value),
    needsInitialSetup,
    hasError,
    
    // Métodos
    checkSystemInitialization,
    getUserCount,
    markSystemAsInitialized,
    resetSystemState
  }
}