var { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('darkmode', {
    toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
    system: () => ipcRenderer.invoke('dark-mode:system')
})