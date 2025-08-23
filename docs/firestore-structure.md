# Estructura de Base de Datos Firestore

## Colección: `userProfile`

Esta colección almacena los perfiles de todos los usuarios administrativos del sistema.

### Estructura del Documento

```typescript
interface UserProfile {
  uid: string;                    // ID único del usuario (Firebase Auth UID)
  email: string;                  // Email del usuario
  nombreCompleto: string;         // Nombre completo del usuario
  telefono?: string;              // Teléfono (opcional)
  rol: 'super_admin' | 'admin' | 'auditor';  // Rol del usuario
  estado: 'activo' | 'inactivo' | 'suspendido';  // Estado de la cuenta
  permisos: {
    gestionRecibos: boolean;      // Puede gestionar recibos
    gestionUsuarios: boolean;     // Puede gestionar usuarios
    reportesAvanzados: boolean;   // Acceso a reportes avanzados
    configuracionSistema: boolean; // Puede configurar el sistema
    auditoria: boolean;           // Acceso a logs de auditoría
    crearAdministradores: boolean; // Puede crear otros administradores
  };
  fechaCreacion: string;          // ISO string de fecha de creación
  fechaUltimoAcceso?: string;     // ISO string del último acceso
  creadoPor: string;              // UID del usuario que lo creó
  configuraciones: {
    notificaciones: boolean;      // Recibir notificaciones
    tema: 'claro' | 'oscuro';     // Tema de la interfaz
    idioma: 'es' | 'en';          // Idioma preferido
  };
  avatar?: string;                // URL del avatar (opcional)
  departamento?: string;          // Departamento al que pertenece
  notas?: string;                 // Notas adicionales sobre el usuario
}
```

### Ejemplo de Documento

```json
{
  "uid": "abc123def456",
  "email": "admin@miscomprobantes.com",
  "nombreCompleto": "Juan Pérez Administrador",
  "telefono": "+52 55 1234 5678",
  "rol": "super_admin",
  "estado": "activo",
  "permisos": {
    "gestionRecibos": true,
    "gestionUsuarios": true,
    "reportesAvanzados": true,
    "configuracionSistema": true,
    "auditoria": true,
    "crearAdministradores": true
  },
  "fechaCreacion": "2024-01-15T10:30:00.000Z",
  "fechaUltimoAcceso": "2024-01-20T14:45:00.000Z",
  "creadoPor": "sistema",
  "configuraciones": {
    "notificaciones": true,
    "tema": "claro",
    "idioma": "es"
  },
  "avatar": "https://example.com/avatar.jpg",
  "departamento": "Administración",
  "notas": "Usuario administrador principal del sistema"
}
```

## Colección: `roles`

Define los roles disponibles en el sistema y sus permisos.

### Estructura del Documento

```typescript
interface Role {
  id: string;                     // ID del rol
  nombre: string;                 // Nombre descriptivo del rol
  descripcion: string;            // Descripción del rol
  permisos: {
    gestionRecibos: boolean;
    gestionUsuarios: boolean;
    reportesAvanzados: boolean;
    configuracionSistema: boolean;
    auditoria: boolean;
    crearAdministradores: boolean;
  };
  activo: boolean;                // Si el rol está activo
  fechaCreacion: string;
  fechaModificacion?: string;
}
```

### Roles Predefinidos

1. **super_admin**: Acceso completo al sistema
2. **admin**: Gestión de recibos y usuarios básicos
3. **auditor**: Solo lectura y reportes básicos

## Colección: `recibosDigitales`

Almacena los recibos digitales generados por la app móvil.

### Estructura del Documento

```typescript
interface ReciboDigital {
  id: string;                     // ID único del recibo
  numeroRecibo: string;           // Número de recibo único
  usuarioAppId: string;           // ID del usuario de la app móvil
  montoTotal: number;             // Monto total del recibo
  moneda: string;                 // Código de moneda (MXN, USD, etc.)
  estado: 'activo' | 'cancelado' | 'pendiente';
  datosRecibo: {
    concepto: string;
    descripcion?: string;
    categoria?: string;
    items?: Array<{
      descripcion: string;
      cantidad: number;
      precioUnitario: number;
      subtotal: number;
    }>;
  };
  hashVerificacion: string;       // Hash para verificación de integridad
  fechaEmision: string;           // ISO string de fecha de emisión
  fechaCreacion: string;
  fechaModificacion?: string;
  creadoPor: string;              // UID del usuario que lo creó
  modificadoPor?: string;         // UID del último usuario que lo modificó
  plantillaId?: string;           // ID de la plantilla utilizada
  archivos?: Array<{
    nombre: string;
    url: string;
    tipo: string;
    tamaño: number;
  }>;
}
```

## Colección: `usuariosApp`

Información de los usuarios de la aplicación móvil MisComprobantes.

### Estructura del Documento

```typescript
interface UsuarioApp {
  id: string;                     // ID único del usuario
  email: string;                  // Email del usuario
  nombreCompleto: string;         // Nombre completo
  telefono?: string;              // Teléfono
  estadoCuenta: 'activo' | 'suspendido' | 'inactivo';
  configuraciones: {
    notificaciones: boolean;
    sincronizacionAuto: boolean;
    formatoRecibo: string;
  };
  estadisticas: {
    totalRecibos: number;
    montoTotalGenerado: number;
    ultimaActividad: string;
  };
  fechaRegistro: string;
  fechaUltimoAcceso?: string;
  dispositivos?: Array<{
    id: string;
    nombre: string;
    plataforma: string;
    version: string;
    ultimoAcceso: string;
  }>;
}
```

## Colección: `auditoria`

Registra todas las acciones importantes realizadas en el sistema.

### Estructura del Documento

```typescript
interface LogAuditoria {
  id: string;                     // ID único del log
  accion: string;                 // Tipo de acción realizada
  usuario: string;                // UID del usuario que realizó la acción
  recurso?: string;               // Recurso afectado (ID de recibo, usuario, etc.)
  detalles: {
    [key: string]: any;           // Detalles específicos de la acción
  };
  datosAnteriores?: any;          // Estado anterior (para modificaciones)
  datosNuevos?: any;              // Estado nuevo (para modificaciones)
  timestamp: string;              // ISO string del momento de la acción
  ip?: string;                    // Dirección IP del usuario
  userAgent?: string;             // User agent del navegador
  resultado: 'exitoso' | 'fallido'; // Resultado de la acción
  errorMessage?: string;          // Mensaje de error si falló
}
```

## Colección: `configuracion`

Configuraciones globales del sistema.

### Documento: `sistema`

```typescript
interface ConfiguracionSistema {
  version: string;                // Versión del sistema
  fechaInicializacion: string;    // Fecha de inicialización
  adminPrincipal: string;         // UID del administrador principal
  configuraciones: {
    maxUsuarios: number;          // Máximo número de usuarios
    retencionLogs: number;        // Días de retención de logs
    backupAutomatico: boolean;    // Backup automático habilitado
    notificacionesEmail: boolean; // Notificaciones por email
    mantenimiento: boolean;       // Modo mantenimiento
  };
  limites: {
    maxRecibosPorUsuario: number;
    maxTamañoArchivo: number;     // En bytes
    maxArchivosRecibo: number;
  };
  integraciones: {
    emailService: {
      habilitado: boolean;
      proveedor: string;
      configuracion: any;
    };
    analytics: {
      habilitado: boolean;
      trackingId?: string;
    };
  };
}
```

## Índices Recomendados

### Para `userProfile`
- `email` (único)
- `rol`
- `estado`
- `fechaCreacion`

### Para `recibosDigitales`
- `numeroRecibo` (único)
- `usuarioAppId`
- `estado`
- `fechaEmision`
- `montoTotal`

### Para `usuariosApp`
- `email` (único)
- `estadoCuenta`
- `fechaRegistro`

### Para `auditoria`
- `usuario`
- `accion`
- `timestamp`
- `recurso`

## Reglas de Seguridad Firestore

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