import { app, BrowserWindow, ipcMain } from 'electron';
import { readFile, readFileSync } from "fs";
import { ServerEvent } from './Interfaces';
import { join } from "path";

import { Config } from "./Interfaces";

import { client as WebSocketClient } from "websocket";
import { TranslateError } from './scripts/TS/scripts';
var client = new WebSocketClient();

var config: Config = require("./configuration/config.json");

var attempt: number = 0; // Amount of times an attempt has been made to connect to websocket

var window: BrowserWindow | null; // Main content window
var updater: BrowserWindow | null; // Updater content window

function WaitToNextStep() {
    return new Promise(function (res, rej) {
        setTimeout(() => {
            res(null);
        }, config.TIME_TO_NEXT_STEP);
    });
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

function update(change: string, data?: any) {
    if (updater != null) updater.webContents.send(`LOADING:UPDATE:${change}`, data);
    console.log(`Sent Screen Update for: "${change}".`)
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
        if (updater == null) return;
        updater.close();
        updater = null;
    });
}

client.on('connectFailed', (err) => {
    console.log("Attempt to connect to Websocket Failed.")
    // console.error(err);
    WaitToNextStep().then(() => {
        wsConnect();
    });
});

client.on("connect", connection => {
    update("WEBSOCKET:SUCCESS")
    console.log("Successfully connected to the Websocket\n" + (new Date()));
    WaitToNextStep().then(() => {
        update("VERSION:CHECK");
        console.log("Packaging Event")
        var event: ServerEvent = {
            Data: {
                Sender: "CLIENT",
                Type: "SEND",
                Demand: "VERSION"
            },
            Content: config.APP_SETTINGS.VERSION
        }
        console.log("Sending Version Check Request")
        WaitToNextStep().then(() => {
            connection.sendUTF(JSON.stringify(event));
            console.log("Request Sent.")
        })
    })

    connection.on("message", message => {
        if (message.type === "utf8") {
            var MessageData: ServerEvent = JSON.parse(message.utf8Data);
            if (MessageData.Data.Sender === "CLIENT") throw new Error("Got Client Event as Client.");
            if (MessageData.Data.Type === "REQUEST") {
                console.log("Request from Server Received.")
                // I'll work on Request Parsing later.
            } else if (MessageData.Data.Type === "SEND") {
                console.log("Received Message from Server.")
                switch (MessageData.Data.Demand) {
                    case "MESSAGE":
                        console.log("Parsed Message as Message.")
                        // No Message Parsing Yet.
                        break;
                    case "VERSION":
                        console.log("Parsed Message as Version");
                        console.log(`Version response of "${MessageData.Content}".`);
                        if (MessageData.Content !== 100) {
                            if (typeof MessageData.Content !== "number") throw new Error("Error Code NaN")
                            update("VERSION:INVALID", MessageData.Content);
                            if (updater != null) updater.close(); updater = null;
                            if (window != null) window.close(); window = null;
                            throw new Error(TranslateError(MessageData.Content));
                        }
                        update("APPLICATION:STARTING")
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
                        break;
                    default:
                        throw new Error("Got Unknown Demand.");
                }
            }
        }
    })
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});