var { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send("MAIN:WINDOW:LOADED")
})

function messageInput(this) {

}