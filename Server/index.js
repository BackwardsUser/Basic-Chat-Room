
//    ____             _                           _     _    _               
//   |  _ \           | |                         | |   | |  | |              
//   | |_) | __ _  ___| | ____      ____ _ _ __ __| |___| |  | |___  ___ _ __ 
//   |  _ < / _` |/ __| |/ /\ \ /\ / / _` | '__/ _` / __| |  | / __|/ _ \ '__|
//   | |_) | (_| | (__|   <  \ V  V / (_| | | | (_| \__ \ |__| \__ \  __/ |   
//   |____/ \__,_|\___|_|\_\  \_/\_/ \__,_|_|  \__,_|___/\____/|___/\___|_|   
//
//      BackwardsUser


// PLEASE NOTE
// If you remove the username from the client, remove it from the database imports.
// I presume you know this already, however for those who don't be warned.

// TABLE LAYOUT
// Feel free to edit as you please;
// messages(authorID INT, username VARCHAR, content VARCHAR)
// sizes of VARCHAR are up to you.

const WebSocketServer = require('websocket').server;
const { readdirSync, readFileSync, writeFileSync } = require('fs');
const path = require('path');
const mysql = require('mysql');
const http = require('http');

const crypto = require('crypto');
const assert = require('assert');

var enc = {
    alg: 'aes-256-cbc', // Just the default, feel free to change this.
    key: null, // KEEP THIS NULL, CHANGE BELOW (ln40)
    iv: null // KEEP THIS NULL, CHANGE BELOW (ln41)
}

const configJSON = readFileSync(path.join(__dirname, "config.json"));
const configOBJ = JSON.parse(configJSON);

if (!configOBJ.enc.alg) configOBJ.enc.alg = enc.alg;
if (!configOBJ.enc.key) configOBJ.enc.key = crypto.randomBytes(32);
if (!configOBJ.enc.iv) configOBJ.enc.iv = crypto.randomBytes(16);

writeFileSync(path.join(__dirname, "config.json"), JSON.stringify(configOBJ, null, 4));

let config = require('./config.json');

let server_port = config.WS_PORT;

let users = {};

const db_connection = mysql.createConnection({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: require('./config.json').DB_PASSWD,
    database: config.DB
});

db_connection.connect();

const server = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(server_port, function () {
    console.log((new Date()) + ' Server is listening on port ' + server_port.toString());
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

function getID() {
    let newID = 0;
    const unavailableIDs = Object.keys(users);
    for (var i = 0; i < unavailableIDs.length; i++) {
        if (newID != unavailableIDs[i]) return newID;
        newID += 1;
    };
    return newID;
};

wsServer.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    const ws_connection = request.accept('echo-protocol', request.origin);
    ws_connection.id = getID();
    users[ws_connection.id] = {
        ip: ws_connection.remoteAddresses,
        connection: ws_connection
    };
    var payload = {
        event_name: 'connectionPayload',
        key: Buffer.from(config.enc.key),
        iv: Buffer.from(config.enc.iv)
    };
    ws_connection.sendUTF(JSON.stringify(payload));

    try {
        const rawContent = `User ${ws_connection.id} has joined the room.`;
        const cipher = crypto.createCipheriv(enc.alg, Buffer.from(config.enc.key), Buffer.from(config.enc.iv));
        const content = cipher.update(rawContent, 'utf-8', 'hex') + cipher.final('hex');
        const join = {
            event_name: 'messageCreate',
            author: {
                id: -1,
                username: undefined
            },
            content: content
        }
        db_connection.query(`INSERT INTO messages (authorID, content) VALUES (${join.author.id}, '${content}');`);
        Object.keys(users).forEach(user => {
            if (users[user].id == ws_connection.id) return;
            users[user].connection.sendUTF(JSON.stringify(join));
        });

        console.log((new Date()) + ' Connection accepted.');
    } catch (err) {
        if (err) throw err;
        return;
    }

    ws_connection.on('message', function (message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            const msg = JSON.parse(message.utf8Data);
            if (!msg.event_name) return;
            switch (msg.event_name) {
                case 'getMessages':
                    const event = {
                        event_name: 'login',
                        id: ws_connection.id
                    };
                    ws_connection.sendUTF(JSON.stringify(event));
                    break;
                case 'messageCreate':
                    if (!msg.content) return;
                    db_connection.query(`INSERT INTO messages (authorID, content) VALUES (${msg.author.id}, '${msg.content}');`);

                    Object.keys(users).forEach(user => {
                        users[user].connection.sendUTF(JSON.stringify(msg));
                    });
                    break;
                case 'syncMessages':
                    db_connection.query(`SELECT * FROM messages;`, (err, results, fields) => {
                        event_obj = {
                            event_name: 'updateMessages',
                            results: results
                        }
                        ws_connection.sendUTF(JSON.stringify(event_obj));
                    });
                    break;
            };
            // ws_connection.sendUTF();
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            ws_connection.sendBytes(message.binaryData);
        }
    });

    ws_connection.on('close', (reasonCode, description) => {
        delete users[ws_connection.id];

        const cipher = crypto.createCipheriv(config.enc.alg, Buffer.from(config.enc.key), Buffer.from(config.enc.iv));
        const rawContent = `User ${ws_connection.id} has left the room.`;
        const content = cipher.update(rawContent, 'utf-8', 'hex') + cipher.final('hex');
        const msg = {
            event_name: 'messageCreate',
            author: {
                id: -1,
                username: undefined
            },
            content: content
        };
        db_connection.query(`INSERT INTO messages (authorID, content) VALUES (${msg.author.id}, '${content}');`);
        Object.keys(users).forEach(user => {
            users[user].connection.sendUTF(JSON.stringify(msg));
        });
        console.log((new Date()) + ' Peer ' + ws_connection.remoteAddress + ' disconnected.');
    });
});