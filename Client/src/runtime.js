const { app, BrowserWindow, ipcMain } = require("electron");
const { readFile, readFileSync } = require("fs");
const { join } = require("path")

var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();

var config = require("./configuration/config.json");

var attempt = 0; // Amount of times an attempt has been made to connect to websocket

var window; // Main content window
var updater; // Updater content window

function WaitToNextStep() {
    return new Promise(function (res, rej) {
        setTimeout(() => {
            res()
        }, config.TIME_TO_NEXT_STEP);
    })
}

if (!config.HARDWARE_ACCELERATION) {
    app.disableHardwareAcceleration();
}

app.on("ready", () => {
    updater = new BrowserWindow({
        frame: false,
        width: 300,
        height: 500,
        alwaysOnTop: true,
        center: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    updater.loadFile(join(__dirname, "views", "updater.html"));
}); 

ipcMain.on("UPDATER:WINDOW:LOADED", () => {
    WaitToNextStep().then(() => {
        wsConnect();
    });
});

ipcMain.on("MAIN:WINDOW:LOADED", () => {
    if (updater != null) {
        updater.close();
        updater = null;
    }
    WaitToNextStep().then(() => {
        // Nothing here yet!
    });
});

function update(change) {
    updater.webContents.send(`LOADING:UPDATE:${change}`);
}

function wsConnect() {
    update("WEBSOCKET:STARTED");
    if (attempt == 0) console.log("Making first attempt");
    if (attempt >= config.MAXIMUM_REATTEMPTS) return wsFailed();
    console.log("Attempting Connection (" + attempt + "/" + config.MAXIMUM_REATTEMPTS + ")");
    client.connect('ws://localhost:8080', 'echo-protocol');
    attempt++;
}

function wsFailed() {
    console.error("Maximum Reattempts reached\nFailed to connect to websocket server");
    update("WEBSOCKET:FAILED");
    attempt = 0;
    WaitToNextStep().then(() => {
        updater.close();
        updater = null;
    });
}

client.on('connectFailed', (err) => {
    console.log("Attempt to connect to Websocket Failed.");
    WaitToNextStep().then(() => {
        wsConnect();
    });
});

client.on("connect", connection => {
    update("WEBSOCKET:SUCCESS")
    console.log("Successfully connected to the Websocket\n"+ ( new Date() ));
    WaitToNextStep().then(() => {

        // Request Version Information ETC.
        update("APPLICATION:STARTING");

        window = new BrowserWindow({
            frame: false,
            width: 1200,
            height: 800,
            center: true,
            resizable: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        window.loadFile(join(__dirname, "views", "index.html"));
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});