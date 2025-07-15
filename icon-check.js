const fs = require("fs");
const path = require("path");

console.log("🔍 Verificando iconos para la aplicación...\n");

// Verificar archivos de icono
const iconFiles = ["public/icon.ico", "public/icon.png", "public/favicon.ico"];

iconFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    console.log(`✅ ${file} - Existe (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`❌ ${file} - NO EXISTE`);
  }
});

// Verificar si el icono se está usando correctamente
console.log("\n📋 Configuración actual:");
console.log("  main.js: public/icon.png");
console.log("  package.json (win): public/icon.ico");

// Sugerencias
console.log("\n💡 Para solucionar problemas de iconos:");
console.log("  1. Asegúrate de que icon.ico sea un archivo válido");
console.log("  2. El icono debe ser de al menos 256x256 píxeles");
console.log("  3. Rebuilding después de cambios: npm run dist-win");
console.log("  4. Limpia cache: rm -rf electron-dist && npm run dist-win");
