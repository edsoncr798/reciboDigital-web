<template>
  <div class="configuracion-page">
    <div class="page-header mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 mb-2">Configuración del Sistema</h1>
          <p class="text-gray-600">Administra parámetros globales y configuraciones</p>
        </div>
        <el-button type="primary" :icon="Setting">
          Guardar Cambios
        </el-button>
      </div>
    </div>

    <el-card>
      <div class="text-center py-12">
        <el-icon class="text-6xl text-gray-400 mb-4"><Setting /></el-icon>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Módulo en Desarrollo</h3>
        <p class="text-gray-500">La configuración del sistema estará disponible próximamente</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Setting } from '@element-plus/icons-vue'
</script>