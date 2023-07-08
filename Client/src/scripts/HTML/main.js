const { ipcRenderer } = require('electron');

window.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send("MAIN:WINDOW:LOADED")
})