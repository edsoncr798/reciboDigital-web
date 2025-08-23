<template>
  <div class="usuario-detalle-page">
    <div class="page-header mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <el-button @click="$router.go(-1)" :icon="ArrowLeft">
            Volver
          </el-button>
          <div>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Detalle del Usuario</h1>
            <p class="text-gray-600">Información completa del usuario seleccionado</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <el-button type="primary" :icon="Edit">
            Editar Usuario
          </el-button>
        </div>
      </div>
    </div>

    <el-card>
      <div class="text-center py-12">
        <el-icon class="text-6xl text-gray-400 mb-4"><User /></el-icon>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Módulo en Desarrollo</h3>
        <p class="text-gray-500">Los detalles del usuario estarán disponibles próximamente</p>
        <p class="text-sm text-gray-400 mt-2">ID del usuario: {{ $route.params.id }}</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Edit, User } from '@element-plus/icons-vue'
</script>