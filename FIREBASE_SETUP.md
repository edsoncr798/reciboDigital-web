# 🔥 Configuración Rápida de Firebase

## ✅ Checklist de Configuración

### Paso 1: Crear Proyecto Firebase
- [ ] Ir a [Firebase Console](https://console.firebase.google.com/)
- [ ] Crear nuevo proyecto: `mis-comprobantes-admin`
- [ ] Registrar aplicación web
- [ ] Copiar configuración de Firebase

### Paso 2: Habilitar Servicios
- [ ] Authentication → Email/Password
- [ ] Firestore Database → Modo test
- [ ] Configurar reglas de seguridad

### Paso 3: Configurar Variables
- [ ] Copiar `.env.example` a `.env`
- [ ] Reemplazar valores demo con configuración real
- [ ] Ejecutar `npm run verify-firebase`

### Paso 4: Crear Usuario Admin
- [ ] Authentication → Add user
- [ ] Firestore → Crear colección `administradores`
- [ ] Agregar documento con UID del usuario

## 🚀 Comandos Útiles

```bash
# Verificar configuración
npm run verify-firebase

# Verificar tipos y configuración
npm run setup-check

# Ejecutar aplicación
npm run dev
```

## 📋 Variables de Entorno Requeridas

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 🔒 Reglas de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /administradores/{adminId} {
      allow read, write: if request.auth != null && request.auth.uid == adminId;
    }
    
    match /usuarios_app/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/administradores/$(request.auth.uid)).data.rol in ['super_admin', 'admin']);
    }
    
    match /recibos_digitales/{reciboId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/administradores/$(request.auth.uid)).data.rol in ['super_admin', 'admin']);
    }
  }
}
```

## 👤 Estructura del Documento Administrador

```javascript
{
  email: "admin@miscomprobantes.com",
  nombre_completo: "Administrador Principal",
  rol: "super_admin", // super_admin | admin | auditor
  activo: true,
  created_at: [timestamp],
  updated_at: [timestamp]
}
```

## 🆘 Solución de Problemas

| Error | Solución |
|-------|----------|
| `Firebase configuration not found` | Verificar variables en `.env` |
| `Permission denied` | Verificar reglas de Firestore |
| `Auth domain not authorized` | Agregar `localhost` a dominios autorizados |
| `User not found in administradores` | Crear documento en colección `administradores` |

---

📖 **Guía completa**: Ver `firebase-config.md` para instrucciones detalladas