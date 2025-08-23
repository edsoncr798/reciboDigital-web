import { ref, computed, reactive } from 'vue'
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import type { UserProfile } from '@/lib/database.types'
import { useSystemSetup } from './useSystemSetup'

// Estado global reactivo
const authState = reactive({
  user: null as User | null,
  userProfile: null as UserProfile | null,
  loading: false,
  error: null as string | null,
  initialized: false
})

export const useAuth = () => {
  const { isSystemInitialized, checkSystemInitialization } = useSystemSetup()
  
  // Getters computados
  const isAuthenticated = computed(() => !!authState.user)
  const userRole = computed(() => authState.userProfile?.rol || null)
  const isAdmin = computed(() => ['admin', 'super_admin'].includes(userRole.value || ''))
  const isSuperAdmin = computed(() => userRole.value === 'super_admin')
  const isAuditor = computed(() => userRole.value === 'auditor')

  // Función para cargar datos del perfil de usuario
  const loadUserProfileData = async (userEmail: string) => {
    try {
      const userQuery = query(
        collection(db, 'userProfile'),
        where('email', '==', userEmail)
      )
      
      const querySnapshot = await getDocs(userQuery)
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0]
        const docData = userDoc.data()
        const userData = {
          uid: userDoc.id,
          id: userDoc.id,
          ...docData
        } as unknown as UserProfile
        authState.userProfile = userData

        // Actualizar último acceso
        await updateDoc(doc(db, 'userProfile', userDoc.id), {
          lastAccess: Timestamp.now()
        })
      } else {
        throw new Error('Perfil de usuario no encontrado')
      }
    } catch (err: any) {
      console.error('Error cargando datos del perfil de usuario:', err)
      authState.error = 'Error cargando datos del usuario'
      throw err
    }
  }

  // Función de login
  const login = async (email: string, password: string) => {
    try {
      authState.loading = true
      authState.error = null

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      authState.user = userCredential.user
      
      await loadUserProfileData(email)
      
      return { success: true }
    } catch (err: any) {
      let errorMessage = 'Error al iniciar sesión'
      
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Credenciales incorrectas'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Intenta más tarde'
          break
        case 'auth/user-disabled':
          errorMessage = 'Usuario deshabilitado'
          break
        default:
          errorMessage = err.message || errorMessage
      }
      
      authState.error = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      authState.loading = false
    }
  }

  // Función de logout
  const logout = async () => {
    try {
      authState.loading = true
      await firebaseSignOut(auth)
      authState.user = null
      authState.userProfile = null
      authState.error = null
    } catch (err: any) {
      authState.error = err.message || 'Error al cerrar sesión'
      throw err
    } finally {
      authState.loading = false
    }
  }

  // Función para inicializar la autenticación
  const initializeAuth = async () => {
    return new Promise<void>((resolve) => {
      if (authState.initialized) {
        resolve()
        return
      }

      authState.loading = true
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        authState.user = user
        
        if (user && user.email) {
          try {
            await loadUserProfileData(user.email)
          } catch (err) {
            console.error('Error cargando datos del perfil de usuario:', err)
          }
        } else {
          authState.userProfile = null
        }
        
        // Verificar si el sistema está inicializado
        await checkSystemInitialization()
        
        authState.loading = false
        authState.initialized = true
        resolve()
        
        // Desuscribirse después de la inicialización
        unsubscribe()
      })
    })
  }

  // Función para limpiar errores
  const clearError = () => {
    authState.error = null
  }

  // Función para obtener el usuario actual
  const getCurrentUser = () => {
    return authState.user
  }

  // Función para verificar permisos
  const hasPermission = (requiredRole: string | string[]) => {
    if (!authState.userProfile) return false
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    return roles.includes(authState.userProfile.rol)
  }

  return {
    // Estado reactivo
    user: computed(() => authState.user),
    userProfile: computed(() => authState.userProfile),
    loading: computed(() => authState.loading),
    error: computed(() => authState.error),
    initialized: computed(() => authState.initialized),
    
    // Getters computados
    isAuthenticated,
    userRole,
    isAdmin,
    isSuperAdmin,
    isAuditor,
    
    // Sistema
    isSystemInitialized,
    
    // Acciones
    login,
    logout,
    initializeAuth,
    clearError,
    getCurrentUser,
    hasPermission
  }
}