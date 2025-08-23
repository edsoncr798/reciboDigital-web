<template>
  <div class="not-found-page min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="text-center max-w-md mx-auto">
      <div class="error-illustration mb-8">
        <el-icon class="text-8xl text-blue-500 mb-4"><Warning /></el-icon>
        <h1 class="text-6xl font-bold text-gray-800 mb-2">404</h1>
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Página no encontrada</h2>
        <p class="text-gray-600 mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
      </div>
      
      <div class="actions space-y-4">
        <el-button 
          type="primary" 
          size="large" 
          @click="goHome"
          class="w-full"
        >
          <el-icon class="mr-2"><HomeFilled /></el-icon>
          Ir al Dashboard
        </el-button>
        
        <el-button 
          @click="goBack"
          size="large"
          class="w-full"
        >
          <el-icon class="mr-2"><Back /></el-icon>
          Volver Atrás
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Warning, HomeFilled, Back } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.not-found-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.error-illustration {
  animation: fadeInUp 0.6s ease-out;
}

.actions {
  animation: fadeInUp 0.8s ease-out;
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
</style>