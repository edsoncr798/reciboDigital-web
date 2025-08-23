<template>
  <div class="perfil-page">
    <div class="page-header mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 mb-2">Mi Perfil</h1>
          <p class="text-gray-600">Administra tu información personal y configuraciones</p>
        </div>
        <el-button type="primary" :icon="Edit">
          Editar Perfil
        </el-button>
      </div>
    </div>

    <el-card>
      <div class="text-center py-12">
        <el-icon class="text-6xl text-gray-400 mb-4"><User /></el-icon>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Módulo en Desarrollo</h3>
        <p class="text-gray-500">La gestión de perfil estará disponible próximamente</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Edit, User } from '@element-plus/icons-vue'
</script>