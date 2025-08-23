<template>
  <el-card class="metric-card" shadow="hover" :body-style="{ padding: '24px' }">
    <div class="metric-content">
      <div class="metric-header flex items-center justify-between mb-4">
        <div class="metric-icon" :class="iconColorClass">
          <el-icon class="text-2xl">
            <component :is="iconComponent" />
          </el-icon>
        </div>
        <div class="metric-change" :class="changeColorClass" v-if="!loading">
          <el-icon class="text-sm">
            <ArrowUp v-if="change && change > 0" />
            <ArrowDown v-else-if="change && change < 0" />
            <Minus v-else />
          </el-icon>
          <span class="text-sm font-medium ml-1">
            {{ Math.abs(change || 0) }}%
          </span>
        </div>
      </div>
      
      <div class="metric-body">
        <div v-if="loading" class="loading-state">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="h1" style="width: 60%; margin-bottom: 8px;" />
              <el-skeleton-item variant="text" style="width: 80%;" />
            </template>
          </el-skeleton>
        </div>
        
        <div v-else class="metric-data">
          <h3 class="metric-value text-2xl font-bold text-gray-800 mb-1">
            {{ value }}
          </h3>
          <p class="metric-title text-sm text-gray-600 font-medium">
            {{ title }}
          </p>
        </div>
      </div>
      
      <!-- Indicador de progreso opcional -->
      <div v-if="showProgress && !loading" class="metric-progress mt-4">
        <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Progreso</span>
          <span>{{ progressValue }}%</span>
        </div>
        <el-progress 
          :percentage="progressValue" 
          :color="progressColor"
          :show-text="false"
          :stroke-width="6"
        />
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Document, 
  User, 
  Money, 
  TrendCharts,
  ArrowUp,
  ArrowDown,
  Minus
} from '@element-plus/icons-vue'

interface Props {
  title: string
  value: string | number
  change?: number
  icon: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  loading?: boolean
  showProgress?: boolean
  progressValue?: number
}

const props = withDefaults(defineProps<Props>(), {
  change: 0,
  loading: false,
  showProgress: false,
  progressValue: 0
})

// Mapeo de iconos
const iconMap = {
  Document,
  User,
  Money,
  TrendCharts
}

// Componente de icono dinámico
const iconComponent = computed(() => {
  return iconMap[props.icon as keyof typeof iconMap] || Document
})

// Clases de color para el icono
const iconColorClass = computed(() => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600'
  }
  return `metric-icon-wrapper ${colorClasses[props.color]}`
})

// Clases de color para el cambio
const changeColorClass = computed(() => {
  if (!props.change) return 'text-gray-500'
  return props.change > 0 ? 'text-green-600' : 'text-red-600'
})

// Color de la barra de progreso
const progressColor = computed(() => {
  const colors = {
    blue: '#3b82f6',
    green: '#10b981',
    purple: '#8b5cf6',
    orange: '#f59e0b',
    red: '#ef4444'
  }
  return colors[props.color]
})
</script>

<style scoped>
.metric-card {
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.metric-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.metric-card:hover .metric-icon-wrapper {
  transform: scale(1.1);
}

.metric-value {
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.metric-change {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  background-color: rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.loading-state {
  min-height: 60px;
}

/* Animaciones */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.metric-card {
  animation: slideInUp 0.6s ease-out;
}

/* Responsive */
@media (max-width: 640px) {
  .metric-card {
    margin-bottom: 1rem;
  }
  
  .metric-header {
    margin-bottom: 1rem;
  }
  
  .metric-icon-wrapper {
    width: 40px;
    height: 40px;
  }
  
  .metric-value {
    font-size: 1.5rem;
  }
}
</style>