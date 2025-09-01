const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const isDev = process.env.NODE_ENV === "development";

let mainWindow;

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

if (!isDev) {
  autoUpdater.setFeedURL({
    provider: "github",
    owner: "GDesasT",
    repo: "mantenimiento-tactil",
    private: false,
  });
}

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
    show: false,
    titleBarStyle: "default",
    frame: true,
    autoHideMenuBar: true,

    title: "Sistema de Gestión de Refacciones",
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:4200");

    mainWindow.webContents.openDevTools();

    try {
      require("electron-reload")(__dirname, {
        electron: path.join(
          __dirname,
          "..",
          "node_modules",
          ".bin",
          "electron"
        ),
        hardResetMethod: "exit",
      });
    } catch (e) {
      console.log("Electron-reload no disponible");
    }
  } else {
    mainWindow.loadFile(
      path.join(__dirname, "dist/mantenimiento-tactil/browser/index.html")
    );
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    if (mainWindow.getBounds().width > 1600) {
      mainWindow.maximize();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require("electron").shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.setZoomFactor(1.0);
}

function createMenu() {
  const template = [
    {
      label: "🔧 Sistema de Gestión de Refacciones",
      submenu: [
        {
          label: "Acerca de",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "Sistema de Gestión de Refacciones",
              message: "Sistema de Gestión de Refacciones",
              detail: `Versión 1.0.0

Sistema para gestión de máquinas y refacciones industriales

Áreas soportadas:
• Área de Corte ✂️
• Área de Costura 🧵

Funciones principales:
• Gestión de máquinas
• Control de refacciones  
• Base de datos local
• Interfaz táctil optimizada`,
              buttons: ["OK"],
            });
          },
        },
        { type: "separator" },
        {
          label: "🔄 Verificar Actualizaciones",
          click: () => {
            checkForUpdates();
          },
        },
        {
          label: "Reiniciar Base de Datos",
          click: () => {
            const response = dialog.showMessageBoxSync(mainWindow, {
              type: "warning",
              title: "Reiniciar Base de Datos",
              message:
                "¿Estás seguro de que quieres reiniciar la base de datos?",
              detail:
                "Esta acción eliminará todos los datos y no se puede deshacer.",
              buttons: ["Cancelar", "Reiniciar"],
              defaultId: 0,
              cancelId: 0,
            });

            if (response === 1) {
              mainWindow.webContents.executeJavaScript(`
                if (window.indexedDB) {
                  window.indexedDB.deleteDatabase('MaintenanceDB').onsuccess = function() {
                    location.reload();
                  };
                }
              `);
            }
          },
        },
        { type: "separator" },
        {
          label: "Salir",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Alt+F4",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Ver",
      submenu: [
        {
          role: "reload",
          label: "Recargar",
          accelerator: "F5",
        },
        {
          role: "forceReload",
          label: "Forzar Recarga",
          accelerator: "Ctrl+F5",
        },
        {
          role: "toggleDevTools",
          label: "Herramientas de Desarrollador",
          accelerator: "F12",
        },
        { type: "separator" },
        {
          role: "resetZoom",
          label: "Zoom Normal",
          accelerator: "Ctrl+0",
        },
        {
          role: "zoomIn",
          label: "Ampliar",
          accelerator: "Ctrl+Plus",
        },
        {
          role: "zoomOut",
          label: "Reducir",
          accelerator: "Ctrl+-",
        },
        { type: "separator" },
        {
          role: "togglefullscreen",
          label: "Pantalla Completa",
          accelerator: "F11",
        },
      ],
    },
    {
      label: "Navegación",
      submenu: [
        {
          label: "🏠 Ir a Inicio",
          accelerator: "Ctrl+H",
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              window.location.hash = '/';
            `);
          },
        },
        { type: "separator" },
        {
          label: "✂️ Ir a Área de Corte",
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              window.location.hash = '/machines/corte';
            `);
          },
        },
        {
          label: "🧵 Ir a Área de Costura",
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              window.location.hash = '/machines/costura';
            `);
          },
        },
      ],
    },
    {
      label: "Ventana",
      submenu: [
        {
          role: "minimize",
          label: "Minimizar",
          accelerator: "Ctrl+M",
        },
        {
          role: "close",
          label: "Cerrar",
          accelerator: "Alt+F4",
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("web-contents-created", (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    require("electron").shell.openExternal(url);
    return { action: "deny" };
  });
});

app.setAsDefaultProtocolClient("mantenimiento-tactil");

process.on("uncaughtException", (error) => {
  console.error("Error crítico:", error);
  dialog.showErrorBox(
    "Error Crítico",
    `Ha ocurrido un error inesperado:\n${error.message}`
  );
});

app.commandLine.appendSwitch("touch-events", "enabled");
app.commandLine.appendSwitch("enable-experimental-web-platform-features");

function checkForUpdates() {
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  } else {
    console.log("🔧 Modo desarrollo: actualizaciones deshabilitadas");
  }
}
