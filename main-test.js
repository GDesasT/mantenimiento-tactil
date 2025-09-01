const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const isDev = process.env.NODE_ENV === "development";

let mainWindow;

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// Para pruebas locales - apunta al servidor local
autoUpdater.setFeedURL({
  provider: "generic",
  url: "http://localhost:3000/",
});

autoUpdater.on("checking-for-update", () => {
  console.log("🔍 Verificando actualizaciones...");
  if (mainWindow) {
    mainWindow.webContents.send("update-status", "checking");
  }
});

autoUpdater.on("update-available", (info) => {
  console.log("✅ Actualización disponible:", info.version);
  if (mainWindow) {
    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        title: "Actualización Disponible",
        message: `Nueva versión disponible: ${info.version}`,
        detail: "Se descargará automáticamente en segundo plano.",
        buttons: ["Descargar Ahora", "Más Tarde"],
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
  }
});

autoUpdater.on("update-not-available", () => {
  console.log("ℹ️ No hay actualizaciones disponibles");
  if (mainWindow) {
    dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Sin Actualizaciones",
      message: "No hay actualizaciones disponibles",
      detail: "Estás usando la versión más reciente.",
    });
  }
});

autoUpdater.on("error", (err) => {
  console.error("❌ Error en actualización:", err);
  if (mainWindow) {
    dialog.showErrorBox(
      "Error de Actualización",
      `Error al verificar actualizaciones: ${err.message}`
    );
  }
});

autoUpdater.on("download-progress", (progressObj) => {
  const logMessage = `📥 Descargando: ${Math.round(progressObj.percent)}%`;
  console.log(logMessage);
  if (mainWindow) {
    mainWindow.webContents.send("download-progress", progressObj);
  }
});

autoUpdater.on("update-downloaded", () => {
  console.log("✅ Actualización descargada");
  if (mainWindow) {
    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        title: "Actualización Lista",
        message: "La actualización se ha descargado correctamente.",
        detail: "La aplicación se reiniciará para aplicar los cambios.",
        buttons: ["Reiniciar Ahora", "Reiniciar Al Cerrar"],
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,

    icon: path.join(__dirname, "public/icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
    },
  });

  // Cargar la aplicación
  if (isDev) {
    mainWindow.loadURL("http://localhost:4200");
  } else {
    mainWindow.loadFile(path.join(__dirname, "src/index.html"));
  }

  // DevTools en desarrollo
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Ocultar barra de menú
  mainWindow.setMenuBarVisibility(false);

  // Configurar menú de aplicación
  const menuTemplate = [
    {
      label: "Archivo",
      submenu: [
        {
          label: "Verificar Actualizaciones",
          click: () => {
            console.log("🔍 Verificando actualizaciones manualmente...");
            autoUpdater.checkForUpdatesAndNotify();
          },
        },
        { type: "separator" },
        {
          label: "Salir",
          accelerator: "Ctrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Ver",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Ventana",
      submenu: [{ role: "minimize" }, { role: "close" }],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Verificar actualizaciones después de 5 segundos
  setTimeout(() => {
    if (!isDev) {
      console.log("🔍 Verificando actualizaciones automáticamente...");
      autoUpdater.checkForUpdatesAndNotify();
    }
  }, 5000);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle("check-for-updates", async () => {
  try {
    console.log("🔍 Verificando actualizaciones via IPC...");
    return await autoUpdater.checkForUpdatesAndNotify();
  } catch (error) {
    console.error("❌ Error verificando actualizaciones:", error);
    throw error;
  }
});

ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

// Protocolo de seguridad
app.setAsDefaultProtocolClient("mantenimiento-touch");
