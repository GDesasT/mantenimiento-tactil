const { app, BrowserWindow, Menu, dialog } = require("electron");
const path = require("path");
const isDev = process.env.NODE_ENV === "development";

let mainWindow;

function createWindow() {
  // Crear la ventana principal
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    // Usar icono desde carpeta public
    icon: path.join(__dirname, "public/icon.PNG"),
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
    // ACTUALIZADO: Título correcto
    title: "Sistema de Gestión de Refacciones",
  });

  // Cargar la aplicación
  if (isDev) {
    // En desarrollo: conectar al servidor Angular
    mainWindow.loadURL("http://localhost:4200");

    // Abrir DevTools en desarrollo
    mainWindow.webContents.openDevTools();

    // Recarga automática en desarrollo (con manejo de errores)
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
    // En producción: cargar archivos estáticos
    mainWindow.loadFile(
      path.join(__dirname, "dist/mantenimiento-tactil/browser/index.html")
    );
  }

  // Mostrar ventana cuando esté lista
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    // Maximizar en pantallas grandes para mejor experiencia táctil
    if (mainWindow.getBounds().width > 1600) {
      mainWindow.maximize();
    }
  });

  // Configurar comportamiento al cerrar
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // ACTUALIZADO: Usar el nuevo método para prevenir navegación externa
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require("electron").shell.openExternal(url);
    return { action: "deny" };
  });

  // Configurar zoom para interfaz táctil
  mainWindow.webContents.setZoomFactor(1.0);
}

// Configurar menú de aplicación
function createMenu() {
  const template = [
    {
      // ACTUALIZADO: Título correcto
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
      // AGREGADO: Menú específico para navegación
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

// Eventos de la aplicación
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

// Configuración de seguridad
app.on("web-contents-created", (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    require("electron").shell.openExternal(url);
    return { action: "deny" };
  });
});

// Configurar protocolo personalizado
app.setAsDefaultProtocolClient("mantenimiento-tactil");

// AGREGADO: Manejo de errores
process.on("uncaughtException", (error) => {
  console.error("Error crítico:", error);
  dialog.showErrorBox(
    "Error Crítico",
    `Ha ocurrido un error inesperado:\n${error.message}`
  );
});

// AGREGADO: Optimización para interfaz táctil
app.commandLine.appendSwitch("touch-events", "enabled");
app.commandLine.appendSwitch("enable-experimental-web-platform-features");
