#!/usr/bin/env node

/**
 * Script para verificar la configuración de Firebase
 * Valida que todas las variables de entorno estén configuradas correctamente
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    log('❌ Archivo .env no encontrado', 'red');
    log('💡 Copia .env.example a .env y configura tus variables de Firebase', 'yellow');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const missingVars = [];
  const demoVars = [];
  
  requiredVars.forEach(varName => {
    const regex = new RegExp(`${varName}=(.+)`);
    const match = envContent.match(regex);
    
    if (!match) {
      missingVars.push(varName);
    } else {
      const value = match[1].trim();
      if (value.includes('demo') || value.includes('tu_') || value.includes('your_')) {
        demoVars.push(varName);
      }
    }
  });
  
  if (missingVars.length > 0) {
    log('❌ Variables de entorno faltantes:', 'red');
    missingVars.forEach(varName => {
      log(`   - ${varName}`, 'red');
    });
    return false;
  }
  
  if (demoVars.length > 0) {
    log('⚠️  Variables con valores demo/placeholder:', 'yellow');
    demoVars.forEach(varName => {
      log(`   - ${varName}`, 'yellow');
    });
    log('💡 Actualiza estas variables con tus valores reales de Firebase', 'yellow');
    return false;
  }
  
  log('✅ Todas las variables de Firebase están configuradas', 'green');
  return true;
}

function checkFirebaseConfig() {
  const configPath = path.join(process.cwd(), 'src', 'lib', 'firebase.ts');
  
  if (!fs.existsSync(configPath)) {
    log('❌ Archivo de configuración de Firebase no encontrado', 'red');
    log(`   Esperado en: ${configPath}`, 'red');
    return false;
  }
  
  log('✅ Archivo de configuración de Firebase encontrado', 'green');
  return true;
}

function checkPackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    log('❌ package.json no encontrado', 'red');
    return false;
  }
  
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const requiredDeps = ['firebase'];
  const missingDeps = [];
  
  requiredDeps.forEach(dep => {
    if (!packageContent.dependencies || !packageContent.dependencies[dep]) {
      missingDeps.push(dep);
    }
  });
  
  if (missingDeps.length > 0) {
    log('❌ Dependencias faltantes:', 'red');
    missingDeps.forEach(dep => {
      log(`   - ${dep}`, 'red');
    });
    log('💡 Ejecuta: npm install firebase', 'yellow');
    return false;
  }
  
  log('✅ Dependencias de Firebase instaladas', 'green');
  return true;
}

function main() {
  log('🔍 Verificando configuración de Firebase...\n', 'blue');
  
  const checks = [
    { name: 'Archivo .env', fn: checkEnvFile },
    { name: 'Configuración Firebase', fn: checkFirebaseConfig },
    { name: 'Dependencias', fn: checkPackageJson }
  ];
  
  let allPassed = true;
  
  checks.forEach(check => {
    log(`\n📋 Verificando: ${check.name}`, 'bold');
    const passed = check.fn();
    if (!passed) {
      allPassed = false;
    }
  });
  
  log('\n' + '='.repeat(50), 'blue');
  
  if (allPassed) {
    log('🎉 ¡Configuración de Firebase completada correctamente!', 'green');
    log('🚀 Puedes ejecutar: npm run dev', 'green');
  } else {
    log('❌ Hay problemas con la configuración', 'red');
    log('📖 Revisa el archivo firebase-config.md para más detalles', 'yellow');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { checkEnvFile, checkFirebaseConfig, checkPackageJson };