# Configuración de Firebase para Panel Administrativo - MisComprobantes

## 📋 Guía Paso a Paso para Configurar Firebase

### 1. Crear Proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto" o "Add project"
3. Nombre del proyecto: `mis-comprobantes-admin` (o el que prefieras)
4. Habilita Google Analytics (opcional)
5. Selecciona tu cuenta de Analytics
6. Haz clic en "Crear proyecto"

### 2. Configurar Aplicación Web

1. En el dashboard del proyecto, haz clic en el ícono web `</>`
2. Nombre de la app: `Panel Administrativo MisComprobantes`
3. **NO** marques "También configura Firebase Hosting"
4. Haz clic en "Registrar app"
5. **COPIA** la configuración que aparece (la necesitarás para el paso 4)

```javascript
// Ejemplo de configuración que obtendrás:
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 3. Habilitar Servicios Necesarios

#### 3.1 Authentication
1. Ve a "Authentication" en el menú lateral
2. Haz clic en "Get started"
3. Ve a la pestaña "Sign-in method"
4. Habilita "Email/Password"
5. **NO** habilites "Email link (passwordless sign-in)"

#### 3.2 Firestore Database
1. Ve a "Firestore Database" en el menú lateral
2. Haz clic en "Create database"
3. Selecciona "Start in test mode" (cambiaremos las reglas después)
4. Elige la ubicación más cercana (ej: `us-central1`)

### 4. Configurar Variables de Entorno

1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza los valores demo con tu configuración real:

```env
# Firebase Configuration (REEMPLAZA CON TUS VALORES REALES)
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# App Configuration
VITE_APP_NAME=Panel Administrativo - MisComprobantes
VITE_APP_VERSION=1.0.0
```

### 5. Configurar Reglas de Seguridad de Firestore

1. Ve a "Firestore Database" → "Rules"
2. Reemplaza las reglas por defecto con estas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para administradores
    match /administradores/{adminId} {
      allow read, write: if request.auth != null && request.auth.uid == adminId;
    }
    
    // Reglas para usuarios de la app
    match /usuarios_app/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/administradores/$(request.auth.uid)).data.rol in ['super_admin', 'admin']);
    }
    
    // Reglas para recibos digitales
    match /recibos_digitales/{reciboId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/administradores/$(request.auth.uid)).data.rol in ['super_admin', 'admin']);
    }
    
    // Reglas para logs de auditoría
    match /logs_auditoria/{logId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false; // Los logs no se pueden modificar
    }
    
    // Reglas para plantillas de recibo
    match /plantillas_recibo/{plantillaId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/administradores/$(request.auth.uid)).data.rol == 'super_admin');
    }
  }
}
```

3. Haz clic en "Publicar"

### 6. Crear Usuario Administrador Inicial

1. Ve a "Authentication" → "Users"
2. Haz clic en "Add user"
3. Email: `admin@miscomprobantes.com` (o tu email preferido)
4. Password: Crea una contraseña segura
5. Haz clic en "Add user"
6. **COPIA el UID** del usuario creado

### 7. Crear Documento de Administrador en Firestore

1. Ve a "Firestore Database" → "Data"
2. Haz clic en "Start collection"
3. Collection ID: `administradores`
4. Document ID: **PEGA el UID** del usuario que creaste
5. Agrega estos campos:

```
email: admin@miscomprobantes.com (string)
nombre_completo: Administrador Principal (string)
rol: super_admin (string)
activo: true (boolean)
created_at: [timestamp actual] (timestamp)
updated_at: [timestamp actual] (timestamp)
```

6. Haz clic en "Save"

### 8. Verificar Configuración

1. Ejecuta el proyecto: `npm run dev`
2. Ve a `http://localhost:5173/login`
3. Intenta hacer login con las credenciales del administrador
4. Si todo está bien configurado, deberías acceder al dashboard

## 🔧 Comandos Útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Verificar tipos TypeScript
npm run type-check
```

## 📚 Estructura de Datos en Firestore

### Colecciones Principales:

- **administradores**: Usuarios del panel administrativo
- **usuarios_app**: Usuarios de la app móvil MisComprobantes
- **recibos_digitales**: Recibos generados por la app
- **logs_auditoria**: Registro de actividades del sistema
- **plantillas_recibo**: Plantillas para generar recibos

## 🚨 Notas Importantes

1. **Seguridad**: Nunca compartas tu archivo `.env` en repositorios públicos
2. **Backup**: Haz backup regular de tu base de datos Firestore
3. **Reglas**: Las reglas de Firestore son críticas para la seguridad
4. **Límites**: Firebase tiene límites gratuitos, revisa el pricing si esperas mucho tráfico

## 🆘 Solución de Problemas

### Error: "Firebase configuration not found"
- Verifica que todas las variables en `.env` estén correctas
- Asegúrate de que no hay espacios extra en las variables

### Error: "Permission denied"
- Verifica que las reglas de Firestore estén configuradas correctamente
- Asegúrate de que el usuario tenga un documento en la colección `administradores`

### Error: "Auth domain not authorized"
- Ve a Authentication → Settings → Authorized domains
- Agrega `localhost` para desarrollo local

---

¿Necesitas ayuda con algún paso? ¡No dudes en preguntar! 🚀