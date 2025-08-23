# Guía de Configuración Inicial - Panel Administrativo MisComprobantes

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener:

- ✅ Node.js 18+ instalado
- ✅ npm o pnpm instalado
- ✅ Proyecto Firebase creado en [Firebase Console](https://console.firebase.google.com)
- ✅ Credenciales de Firebase configuradas en `.env`

## 🚀 Pasos de Configuración

### 1. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env` y completa las variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de Firebase:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# App Configuration
VITE_APP_NAME=Panel Administrativo - MisComprobantes
VITE_APP_VERSION=1.0.0
```

### 2. Instalar Dependencias

```bash
npm install
# o
pnpm install
```

### 3. Verificar Configuración de Firebase

Ejecuta el script de verificación:

```bash
npm run verify-firebase
```

Este script verificará que:
- ✅ Todas las variables de entorno estén configuradas
- ✅ Las dependencias de Firebase estén instaladas
- ✅ La conexión a Firebase funcione correctamente

### 4. Configurar Firebase Console

#### 4.1 Habilitar Authentication

1. Ve a **Authentication** > **Sign-in method**
2. Habilita **Email/Password**
3. Configura dominios autorizados si es necesario

#### 4.2 Crear Base de Datos Firestore

1. Ve a **Firestore Database**
2. Crea una base de datos en modo **producción**
3. Selecciona la región más cercana

#### 4.3 Configurar Reglas de Seguridad

En **Firestore Database** > **Rules**, reemplaza las reglas por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para userProfile
    match /userProfile/{userId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/userProfile/$(request.auth.uid)).data.permisos.gestionUsuarios == true);
    }
    
    // Reglas para recibosDigitales
    match /recibosDigitales/{reciboId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/userProfile/$(request.auth.uid)).data.permisos.gestionRecibos == true;
    }
    
    // Reglas para usuariosApp
    match /usuariosApp/{usuarioId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/userProfile/$(request.auth.uid)).data.permisos.gestionUsuarios == true;
    }
    
    // Reglas para auditoria
    match /auditoria/{logId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/userProfile/$(request.auth.uid)).data.permisos.auditoria == true;
      allow create: if request.auth != null;
    }
    
    // Reglas para configuracion
    match /configuracion/{configId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/userProfile/$(request.auth.uid)).data.permisos.configuracionSistema == true;
    }
    
    // Reglas para roles
    match /roles/{roleId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/userProfile/$(request.auth.uid)).data.rol == 'super_admin';
    }
  }
}
```

### 5. Crear el Primer Usuario Administrador

Ejecuta el script de configuración inicial:

```bash
node scripts/setup-admin.js
```

El script te pedirá:
- 📧 **Email del administrador**
- 🔒 **Contraseña** (mínimo 6 caracteres)
- 👤 **Nombre completo**
- 📱 **Teléfono** (opcional)

**Ejemplo de ejecución:**

```
🔥 Configuración del Primer Usuario Administrador
================================================

📧 Email del administrador: admin@miscomprobantes.com
🔒 Contraseña (mínimo 6 caracteres): ********
👤 Nombre completo: Juan Pérez Administrador
📱 Teléfono (opcional): +52 55 1234 5678

⏳ Creando usuario administrador...
✅ Usuario creado en Firebase Auth: abc123def456
✅ Perfil creado en Firestore
✅ Configuración del sistema inicializada
✅ Roles del sistema creados
✅ Log de auditoría inicial creado

🎉 ¡Configuración completada exitosamente!

📋 Resumen:
   👤 Usuario: admin@miscomprobantes.com
   🔑 UID: abc123def456
   👑 Rol: Super Administrador
   📅 Fecha: 15/1/2024, 10:30:00

🚀 Ahora puedes acceder al panel administrativo en:
   http://localhost:5174/login

⚠️  IMPORTANTE: Guarda estas credenciales de forma segura.
```

### 6. Iniciar la Aplicación

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:5174**

### 7. Primer Acceso

1. Ve a **http://localhost:5174/login**
2. Ingresa las credenciales del administrador creado
3. Serás redirigido al dashboard principal

## 🔧 Configuración Adicional

### Crear Usuarios Adicionales

1. Accede al panel como Super Administrador
2. Ve a **Gestión de Usuarios**
3. Haz clic en **Nuevo Usuario**
4. Completa el formulario con:
   - Nombre completo
   - Email
   - Rol (Super Admin, Admin, Auditor)
   - Departamento
   - Contraseña

### Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **Super Administrador** | Acceso completo: gestión de usuarios, configuración del sistema, reportes avanzados, auditoría |
| **Administrador** | Gestión de recibos, usuarios básicos, reportes básicos, auditoría |
| **Auditor** | Solo lectura: visualización de recibos, reportes básicos, logs de auditoría |

### Configurar Notificaciones (Opcional)

1. Ve a **Configuración del Sistema**
2. Habilita **Notificaciones por Email**
3. Configura el proveedor de email

## 🛠️ Comandos Útiles

```bash
# Verificar configuración de Firebase
npm run verify-firebase

# Verificar dependencias y configuración
npm run setup-check

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview

# Ejecutar linter
npm run lint

# Ejecutar verificación de tipos
npm run type-check
```

## 🔍 Solución de Problemas

### Error: "Variables de entorno no configuradas"

**Solución:**
1. Verifica que el archivo `.env` existe
2. Asegúrate de que todas las variables estén completas
3. Reinicia el servidor de desarrollo

### Error: "Permission denied for table"

**Solución:**
1. Verifica las reglas de Firestore
2. Asegúrate de que el usuario tenga los permisos correctos
3. Revisa que las reglas estén publicadas

### Error: "Email already in use"

**Solución:**
1. El email ya existe en Firebase Auth
2. Usa el script con la opción de crear perfil para usuario existente
3. O usa un email diferente

### Error de conexión a Firebase

**Solución:**
1. Verifica las credenciales en `.env`
2. Asegúrate de que el proyecto Firebase esté activo
3. Revisa la configuración de dominios autorizados

## 📚 Recursos Adicionales

- [Documentación de Firebase](https://firebase.google.com/docs)
- [Guía de Firestore](https://firebase.google.com/docs/firestore)
- [Reglas de Seguridad](https://firebase.google.com/docs/firestore/security/get-started)
- [Element Plus](https://element-plus.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🆘 Soporte

Si encuentras problemas durante la configuración:

1. Revisa esta documentación
2. Verifica los logs de la consola del navegador
3. Ejecuta `npm run verify-firebase` para diagnóstico
4. Consulta la documentación de Firebase

---

**¡Felicidades! Tu panel administrativo está listo para usar.** 🎉