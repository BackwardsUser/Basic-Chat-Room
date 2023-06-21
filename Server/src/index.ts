// Just a Dummy Server
// Makes "fake" returns to the client

import { server } from "websocket";
import { connection } from "websocket";
import { user } from "./Interfaces";

import { createServer } from "node:http";

var httpServer = createServer(function (req, res) {
    console.log((new Date()) + ' Received request for ' + req.url);
    res.writeHead(404);
    res.end();
});
httpServer.listen(8080, function () {
    console.log((new Date()) + ' Server is listening on port 8080');
});

var wsServer = new server({
    httpServer: httpServer,
    autoAcceptConnections: false
})

function OriginIsAllowed(origin: string): boolean {
    // Logic to determine if origin should be allowed, too lazy to write right now.
    return true;
}

var users: user[] = [];

function formatSessionID(sessionID: number): string {
    return "0x" + ((sessionID).toString(16).padStart(16, "0").toUpperCase());
}

function getNewSessionID(): string {
    if (users.length == 0) return formatSessionID(1);
    for (var i = 0; i < users.length; i++) {
        var fDecimalSessionID = parseInt(users[i].sessionID, 16);
        if ((fDecimalSessionID + 1).toString(16).length > 16) return "ERROR: Too many online users! Either up the user count, or bring down member count!";
        if (!users[i + 1]) return formatSessionID(fDecimalSessionID + 1);
        var sDecimalSessionID = parseInt(users[i + 1].sessionID, 16);
        if ((fDecimalSessionID++) != sDecimalSessionID) return formatSessionID(fDecimalSessionID + 1)
        else continue;
    }
}

function removeUser(connection: connection): void {
    var userIndex = users.findIndex(user => user.connection == connection);
    users.splice(userIndex, 1);
}

wsServer.on('request', function (req) {
    if (!OriginIsAllowed(req.origin)) {
        req.reject();
        console.log((new Date()) + ' Connection from origin ' + req.origin + ' has been rejected.');
        return;
    }

    var connection = req.accept('echo-protocol', req.origin);
    console.log((new Date()) + ' Connection accepted.');

    var user: user = {
        sessionID: getNewSessionID(),
        connection: connection
    }

    users.push(user);

    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            console.log('Received message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received binary message of: ' + message.binaryData.length + ' bytes.');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function (reasonCode, description) {
        removeUser(connection)
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});