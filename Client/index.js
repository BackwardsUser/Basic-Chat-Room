
//    ____             _                           _     _    _               
//   |  _ \           | |                         | |   | |  | |              
//   | |_) | __ _  ___| | ____      ____ _ _ __ __| |___| |  | |___  ___ _ __ 
//   |  _ < / _` |/ __| |/ /\ \ /\ / / _` | '__/ _` / __| |  | / __|/ _ \ '__|
//   | |_) | (_| | (__|   <  \ V  V / (_| | | | (_| \__ \ |__| \__ \  __/ |   
//   |____/ \__,_|\___|_|\_\  \_/\_/ \__,_|_|  \__,_|___/\____/|___/\___|_|   
//
//      BackwardsUser



const { app, ipcMain, BrowserWindow } = require('electron');
const WebSocketClient = require('websocket').client;
const { readdirSync } = require('fs');
const { Buffer } = require("buffer");
const crypto = require('crypto');
const assert = require('assert');
const path = require('path');

var encryptionData = {
    key: null,
    iv: null
}

let config;
if ( readdirSync(path.join(__dirname)).filter(file => file.startsWith("privConfig.json"))[0] ) {
    config = require('./privConfig.json');
} else {
    config = require('./config.json');
}

var uid;

const client = new WebSocketClient();
let mainWindow;

client.on('connectFailed', (err) => {
    console.log('Connection Error: ' + err.toString());
    app.exit();
});

client.on('connect', (connection) => {
    console.log('WebSocket Client Connected');

    connection.on('error', (err) => {
        console.log('Connection Error: ' + err.toString());
    });

    connection.on('close', () => {
        console.log('echo-protocol Connection Closed');
        app.exit();
    });
    connection.on('message', (message) => {
        if (message.type === 'utf8') {
            const event = JSON.parse(message.utf8Data);
            event["enc"] = encryptionData;
            switch (event.event_name) {
                case 'login':
                    uid = event.id;
                    break;
                case 'messageCreate':
                    mainWindow.webContents.send('message:create', JSON.stringify(event));
                    break;
                case 'updateMessages':
                    mainWindow.webContents.send('message:create', JSON.stringify(event));
                    break;
                case 'connectionPayload':
                    encryptionData.key = event.key;
                    encryptionData.iv = event.iv;
                    break;
            }
        };
    });

    function fireEvent(content) {
        if (connection.connected) {
            connection.send(JSON.stringify(content));
        };
    };

    const event_obj = {
        event_name: 'getMessages',
        author: {
            id: uid
        }
    };

    fireEvent(event_obj);

    ipcMain.on('message:send', (e, rawContent) => {
        const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(encryptionData.key), Buffer.from(encryptionData.iv));
        const content = cipher.update(rawContent, 'utf-8', 'hex') + cipher.final('hex');

        const event_obj = {
            event_name: 'messageCreate',
            author: {
                id: uid
            },
            content: content
        };
        fireEvent(event_obj);
    });

    ipcMain.on('message:update', () => {
        const event_obj = {
            event_name: 'syncMessages'
        };
        fireEvent(event_obj);
    });
});

app.once('ready', () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    mainWindow.once('closed', () => {
        app.exit();
        delete client;
    });

})

client.connect(config.WS_IP, 'echo-protocol');