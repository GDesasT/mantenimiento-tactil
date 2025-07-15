const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🔍 Diagnóstico de Build - Sistema de Mantenimiento");
console.log("================================================\n");

// 1. Verificar archivos necesarios
console.log("1. Verificando archivos requeridos...");
const requiredFiles = [
  "main.js",
  "package.json",
  "public/icon.ico",
  "public/icon.PNG",
];

requiredFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - Existe`);
  } else {
    console.log(`❌ ${file} - NO EXISTE`);
  }
});

// 2. Verificar carpeta dist
console.log("\n2. Verificando carpeta dist...");
if (fs.existsSync("dist")) {
  console.log("✅ Carpeta dist existe");
  const distFiles = fs.readdirSync("dist");
  console.log(`   Archivos en dist: ${distFiles.length}`);
} else {
  console.log(
    "❌ Carpeta dist NO existe - Necesitas ejecutar ng build primero"
  );
}

// 3. Verificar dependencias
console.log("\n3. Verificando dependencias...");
exec("npm list electron-builder --depth=0", (error, stdout, stderr) => {
  if (error) {
    console.log("❌ electron-builder no está instalado correctamente");
  } else {
    console.log("✅ electron-builder está disponible");
  }
});

console.log("\n4. Comandos recomendados:");
console.log("   npm run build-electron    # Build Angular");
console.log("   npm run dist-win          # Build completo");
console.log("   npm run pack-win          # Solo empaquetado (más rápido)");
