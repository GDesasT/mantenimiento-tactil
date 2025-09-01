const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const ELECTRON_DIST = path.join(__dirname, "electron-dist");

// Tipos MIME
const mimeTypes = {
  ".yml": "text/yaml",
  ".exe": "application/octet-stream",
  ".blockmap": "application/json",
  ".json": "application/json",
};

const server = http.createServer((req, res) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Configurar CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  let filePath;

  // Rutas específicas para electron-updater
  if (req.url === "/latest.yml") {
    filePath = path.join(ELECTRON_DIST, "latest.yml");
  } else if (req.url.includes(".exe")) {
    // Extraer nombre del archivo del URL
    const fileName = path.basename(req.url);
    filePath = path.join(ELECTRON_DIST, fileName);
  } else if (req.url.includes(".blockmap")) {
    const fileName = path.basename(req.url);
    filePath = path.join(ELECTRON_DIST, fileName);
  } else {
    res.writeHead(404);
    res.end("Not Found");
    return;
  }

  // Verificar si el archivo existe
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Archivo no encontrado: ${filePath}`);
    res.writeHead(404);
    res.end("File Not Found");
    return;
  }

  // Obtener estadísticas del archivo
  const stat = fs.statSync(filePath);
  const ext = path.extname(filePath);
  const mimeType = mimeTypes[ext] || "application/octet-stream";

  // Configurar headers
  res.setHeader("Content-Type", mimeType);
  res.setHeader("Content-Length", stat.size);
  res.setHeader("Last-Modified", stat.mtime.toUTCString());

  // Para archivos .exe, configurar headers adicionales
  if (ext === ".exe") {
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${path.basename(filePath)}"`
    );
  }

  console.log(
    `✅ Sirviendo: ${path.basename(filePath)} (${(
      stat.size /
      1024 /
      1024
    ).toFixed(2)} MB)`
  );

  // Crear stream de lectura y enviar archivo
  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);

  readStream.on("error", (err) => {
    console.error(`❌ Error leyendo archivo: ${err.message}`);
    res.writeHead(500);
    res.end("Internal Server Error");
  });
});

server.listen(PORT, () => {
  console.log("🚀 Servidor de actualización iniciado!");
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log("📄 Endpoints disponibles:");
  console.log(`   • http://localhost:${PORT}/latest.yml`);
  console.log(
    `   • http://localhost:${PORT}/Sistema-de-Gestion-de-Refacciones-Setup-1.0.1.exe`
  );
  console.log("");
  console.log("🔄 Esperando solicitudes de actualización...");
});

server.on("error", (err) => {
  console.error(`❌ Error del servidor: ${err.message}`);
});
