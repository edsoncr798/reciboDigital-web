import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './style.css'
import App from './App.vue'
import router from './router'

// Crear instancia de Vue
const app = createApp(App)

// Registrar iconos de Element Plus
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Usar plugins
app.use(router)
app.use(ElementPlus)

// Montar aplicación
app.mount('#app')
