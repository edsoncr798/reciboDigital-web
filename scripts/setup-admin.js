#!/usr/bin/env node

/**
 * Script para configurar el primer usuario administrador en Firebase
 * Crea la colección 'userProfile' con la estructura necesaria
 */

const { initializeApp } = require('firebase/app')
const { getFirestore, doc, setDoc, collection, addDoc } = require('firebase/firestore')
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth')
const readline = require('readline')
require('dotenv').config()

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Interfaz de línea de comandos
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Función para hacer preguntas
const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

// Estructura de permisos por rol
const rolePermissions = {
  super_admin: {
    gestionRecibos: true,
    gestionUsuarios: true,
    reportesAvanzados: true,
    configuracionSistema: true,
    auditoria: true,
    crearAdministradores: true
  },
  admin: {
    gestionRecibos: true,
    gestionUsuarios: true,
    reportesAvanzados: false,
    configuracionSistema: false,
    auditoria: true,
    crearAdministradores: false
  },
  auditor: {
    gestionRecibos: false,
    gestionUsuarios: false,
    reportesAvanzados: false,
    configuracionSistema: false,
    auditoria: true,
    crearAdministradores: false
  }
}

// Función para crear el perfil de usuario en Firestore
const createUserProfile = async (uid, userData) => {
  const userProfile = {
    uid: uid,
    email: userData.email,
    nombreCompleto: userData.nombreCompleto,
    telefono: userData.telefono || '',
    rol: userData.rol,
    estado: 'activo',
    permisos: rolePermissions[userData.rol],
    fechaCreacion: new Date().toISOString(),
    fechaUltimoAcceso: null,
    creadoPor: 'sistema',
    configuraciones: {
      notificaciones: true,
      tema: 'claro',
      idioma: 'es'
    },
    avatar: '',
    departamento: userData.departamento || '',
    notas: userData.notas || 'Usuario administrador inicial creado por el sistema'
  }

  try {
    await setDoc(doc(db, 'userProfile', uid), userProfile)
    console.log('✅ Perfil de usuario creado en Firestore')
    return userProfile
  } catch (error) {
    console.error('❌ Error al crear perfil de usuario:', error)
    throw error
  }
}

// Función para crear colecciones iniciales del sistema
const createSystemCollections = async () => {
  try {
    // Crear colección de roles
    const rolesData = [
      {
        id: 'super_admin',
        nombre: 'Super Administrador',
        descripcion: 'Acceso completo al sistema',
        permisos: rolePermissions.super_admin,
        activo: true,
        fechaCreacion: new Date().toISOString()
      },
      {
        id: 'admin',
        nombre: 'Administrador',
        descripcion: 'Gestión de recibos y usuarios básicos',
        permisos: rolePermissions.admin,
        activo: true,
        fechaCreacion: new Date().toISOString()
      },
      {
        id: 'auditor',
        nombre: 'Auditor',
        descripcion: 'Solo lectura y reportes básicos',
        permisos: rolePermissions.auditor,
        activo: true,
        fechaCreacion: new Date().toISOString()
      }
    ]

    for (const role of rolesData) {
      await setDoc(doc(db, 'roles', role.id), role)
    }
    console.log('✅ Colección de roles creada')

    // Crear configuración inicial del sistema
    const systemConfig = {
      version: '1.0.0',
      fechaInicializacion: new Date().toISOString(),
      adminPrincipal: '',
      configuraciones: {
        maxUsuarios: 100,
        retencionLogs: 90,
        backupAutomatico: true,
        notificacionesEmail: false,
        mantenimiento: false
      },
      limites: {
        maxRecibosPorUsuario: 1000,
        maxTamañoArchivo: 10485760, // 10MB
        maxArchivosRecibo: 5
      }
    }

    await setDoc(doc(db, 'configuracion', 'sistema'), systemConfig)
    console.log('✅ Configuración del sistema creada')

  } catch (error) {
    console.error('❌ Error al crear colecciones del sistema:', error)
    throw error
  }
}

// Función principal
const setupAdmin = async () => {
  console.log('🔥 Configuración inicial de Firebase - Panel Administrativo MisComprobantes')
  console.log('==================================================================')
  console.log('')

  try {
    // Verificar configuración de Firebase
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'demo-api-key') {
      console.error('❌ Error: Configuración de Firebase no encontrada o usando valores demo')
      console.log('Por favor, configura las variables de entorno en el archivo .env')
      process.exit(1)
    }

    console.log('✅ Configuración de Firebase verificada')
    console.log('')

    // Recopilar datos del administrador
    console.log('📝 Datos del primer usuario administrador:')
    const email = await question('Email: ')
    const password = await question('Contraseña (mínimo 6 caracteres): ')
    const nombreCompleto = await question('Nombre completo: ')
    const telefono = await question('Teléfono (opcional): ')
    const departamento = await question('Departamento (opcional): ')
    
    console.log('')
    console.log('🔐 Selecciona el rol:')
    console.log('1. Super Administrador (acceso completo)')
    console.log('2. Administrador (gestión básica)')
    console.log('3. Auditor (solo lectura)')
    
    const rolOption = await question('Opción (1-3): ')
    
    const roles = ['super_admin', 'admin', 'auditor']
    const rol = roles[parseInt(rolOption) - 1] || 'admin'

    console.log('')
    console.log('🚀 Creando usuario administrador...')

    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    console.log('✅ Usuario creado en Firebase Auth')

    // Crear perfil en Firestore
    const userProfile = await createUserProfile(user.uid, {
      email,
      nombreCompleto,
      telefono,
      rol,
      departamento,
      notas: 'Usuario administrador inicial'
    })

    // Crear colecciones del sistema
    await createSystemCollections()

    // Actualizar configuración con admin principal
    await setDoc(doc(db, 'configuracion', 'sistema'), {
      adminPrincipal: user.uid
    }, { merge: true })

    console.log('')
    console.log('🎉 ¡Configuración completada exitosamente!')
    console.log('================================================')
    console.log(`👤 Usuario: ${email}`)
    console.log(`🏷️  Rol: ${rol}`)
    console.log(`🆔 UID: ${user.uid}`)
    console.log('')
    console.log('📋 Estructura de colecciones creada:')
    console.log('   • userProfile - Perfiles de usuarios administradores')
    console.log('   • roles - Definición de roles y permisos')
    console.log('   • configuracion - Configuración del sistema')
    console.log('')
    console.log('🌐 Puedes acceder al panel en: http://localhost:5174/login')
    console.log('')

  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message)
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('💡 El email ya está registrado. Usa otro email o elimina el usuario existente.')
    } else if (error.code === 'auth/weak-password') {
      console.log('💡 La contraseña es muy débil. Usa al menos 6 caracteres.')
    } else if (error.code === 'auth/invalid-email') {
      console.log('💡 El formato del email no es válido.')
    }
  } finally {
    rl.close()
    process.exit(0)
  }
}

// Ejecutar script
if (require.main === module) {
  setupAdmin()
}

module.exports = { setupAdmin, createUserProfile, rolePermissions }