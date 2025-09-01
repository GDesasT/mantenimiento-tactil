const { contextBridge, ipcRenderer } = require("electron");

// Exponer API segura al renderer process
contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    invoke: (channel, ...args) => {
      // Permitir solo canales específicos
      const validChannels = ["check-for-updates", "get-app-version"];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
    },
    on: (channel, func) => {
      const validChannels = ["update-status", "download-progress"];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    removeAllListeners: (channel) => {
      const validChannels = ["update-status", "download-progress"];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeAllListeners(channel);
      }
    },
  },
});
