import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useSystemSetup } from '@/composables/useSystemSetup'
import AdminLayout from '@/layouts/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/setup',
      name: 'setup',
      component: () => import('@/pages/SetupPage.vue'),
      meta: { requiresNoAuth: true, allowUninitialized: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { requiresNoAuth: true }
    },
    {
      path: '/dashboard',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/pages/DashboardPage.vue')
        }
      ]
    },
    {
      path: '/recibos',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'recibos',
          component: () => import('@/pages/RecibosPage.vue')
        },
        {
          path: ':id',
          name: 'recibo-detalle',
          component: () => import('@/pages/ReciboDetallePage.vue')
        }
      ]
    },
    {
      path: '/usuarios',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'usuarios',
          component: () => import('@/pages/UsuariosPage.vue')
        },
        {
          path: ':id',
          name: 'usuario-detalle',
          component: () => import('@/pages/UsuarioDetallePage.vue')
        }
      ]
    },
    {
      path: '/reportes',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'reportes',
          component: () => import('@/pages/ReportesPage.vue')
        },
        {
          path: 'analytics',
          name: 'analytics',
          component: () => import('@/pages/AnalyticsPage.vue')
        }
      ]
    },
    {
      path: '/configuracion',
      component: AdminLayout,
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'configuracion',
          component: () => import('@/pages/ConfiguracionPage.vue')
        }
      ]
    },
    {
      path: '/auditoria',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'auditoria',
          component: () => import('@/pages/AuditoriaPage.vue')
        }
      ]
    },
    {
      path: '/perfil',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'perfil',
          component: () => import('@/pages/PerfilPage.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFoundPage.vue')
    }
  ]
})

// Middleware de autenticación y validación del sistema
router.beforeEach(async (to, from, next) => {
  const auth = useAuth()
  const systemSetup = useSystemSetup()
  
  try {
    // Inicializar autenticación si no está inicializada
    if (!auth.initialized.value) {
      await auth.initializeAuth()
    }
    
    const isAuthenticated = auth.isAuthenticated.value
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const requiresNoAuth = to.matched.some(record => record.meta.requiresNoAuth)
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
    const allowUninitialized = to.matched.some(record => record.meta.allowUninitialized)
    
    // 1. Verificar si el sistema está inicializado (solo si no es una ruta que permite sistema no inicializado)
    if (!allowUninitialized) {
      const isSystemInitialized = await systemSetup.checkSystemInitialization()
      
      if (!isSystemInitialized && to.path !== '/setup') {
        console.log('Sistema no inicializado, redirigiendo a setup')
        next('/setup')
        return
      }
    }
    
    // 2. Si está en setup pero el sistema ya está inicializado, redirigir al login
    if (to.path === '/setup') {
      const isSystemInitialized = await systemSetup.checkSystemInitialization()
      if (isSystemInitialized) {
        console.log('Sistema ya inicializado, redirigiendo a login')
        next('/login')
        return
      }
    }
    
    // 3. Verificar autenticación
    if (requiresAuth && !isAuthenticated) {
      console.log('Ruta requiere autenticación, redirigiendo a login')
      next('/login')
      return
    }
    
    // 4. Si está autenticado y trata de acceder a rutas de no autenticación
    if (requiresNoAuth && isAuthenticated) {
      console.log('Usuario autenticado, redirigiendo a dashboard')
      next('/dashboard')
      return
    }
    
    // 5. Verificar permisos de administrador
    if (requiresAdmin && isAuthenticated) {
      if (!auth.isAdmin.value) {
        console.log('Acceso denegado: se requieren permisos de administrador')
        next('/dashboard') // Redirigir a dashboard si no tiene permisos
        return
      }
    }
    
    // 6. Verificar que el usuario tenga un perfil válido
    if (isAuthenticated && !auth.userProfile.value) {
      console.log('Usuario sin perfil válido, cerrando sesión')
      await auth.logout()
      next('/login')
      return
    }
    
    // 7. Todo está bien, continuar
    next()
    
  } catch (error) {
    console.error('Error en middleware de navegación:', error)
    // En caso de error, redirigir a login
    next('/login')
  }
})

export default router
