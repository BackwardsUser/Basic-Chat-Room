const { readFileSync } = require("fs");
const { join } = require("path");
const { ipcRenderer } = require("electron");

const config = require("../configuration/config.json");

var splashes = readFileSync(join(__dirname, "..", "assets", "messages", "updaterSplashes.txt"), "utf8").split(/\r?\n/);
var ran = Math.floor(Math.random() * splashes.length);
var splash = splashes[ran];

var bottomText = document.getElementById("bottom");
var topText = document.getElementById("top");

var topTextString = "Loading"
var topTextLoad = "."

bottomText.innerText = splash;

ipcRenderer.send("UPDATER:WINDOW:LOADED")

ipcRenderer.on("LOADING:UPDATE:WEBSOCKET:STARTED", () => {
    topTextString = "Connecting to Server"
})

var loadingDots = setInterval(() => {
    topText.innerText = topTextString + topTextLoad;
    if (topTextLoad.split("").length == 3) topTextLoad = ""
    else topTextLoad += ".";
}, config.TIME_TO_NEXT_STEP/4);

ipcRenderer.on("LOADING:UPDATE:WEBSOCKET:FAILED", () => {
    clearInterval(loadingDots);
    topTextString = "Connection Failed";
    topText.innerText = topTextString;
    bottomText.innerText = "Please connect to the internet,\nor try again later.";
});

ipcRenderer.on("LOADING:UPDATE:WEBSOCKET:SUCCESS", () => {
    clearInterval(loadingDots);
    topTextString = "Connection Successful";
    topText.innerText = topTextString;
});

ipcRenderer.on("LOADING:UPDATE:APPLICATION:STARTING", () => {
    loadingDots = setInterval(() => {
        topText.innerText = topTextString + topTextLoad;
        if (topTextLoad.split("").length == 3) topTextLoad = ""
        else topTextLoad += ".";
    }, config.TIME_TO_NEXT_STEP/4);

    topTextString = "Starting App";
    topText.innerText = topTextString;
})