// Add Watermark (Too lazy to right now)

import { server } from "websocket";
import { connection } from "websocket";
import { CompareVersions, TranslateError, VersionFixer } from "./scripts";
import { User, Config, ServerEvent } from "./Interfaces";

import { createServer, Server } from "node:http";

import * as config from "./config.json";
import { Content, Version } from "./types";


var httpServer = createServer(function (req, res) {
    console.log((new Date()) + ' Received request for ' + req.url);
    res.writeHead(404);
    res.end();
});
httpServer.listen(8080, function () {
    console.log((new Date()) + ' Server is listening on port 8080');
    console.log(`Server Running on Version: ${config.APP_SETTINGS.VERSION}`);
});

var wsServer = new server({
    httpServer: httpServer,
    autoAcceptConnections: false
})

function OriginIsAllowed(origin: string): boolean {
    // Logic to determine if origin should be allowed, too lazy to write right now.
    return true;
}

var users: User[] = [];

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


function CheckUpdate(ClientVersion: Version): Promise<void> {
    return new Promise((res, rej) => {

        var FixedServerVersion: Version = (ClientVersion.startsWith("~")) ? VersionFixer(config.APP_SETTINGS.VERSION) : VersionFixer(config.APP_SETTINGS.NIGHTLY_VERSION);
        if (ClientVersion.startsWith("~"))
        if (FixedServerVersion === null) rej(301)
        var ComparedVersions = CompareVersions(ClientVersion, FixedServerVersion)
        if (ComparedVersions === 300) rej(300)
        else if (ComparedVersions == true) res()
        else {
            // Run Code to install the update on the Client.
            if (false) rej(402) // 203 is called when update fails to be retrieved.
            res();
        };
    })
}



wsServer.on('request', function (req) {
    if (!OriginIsAllowed(req.origin)) {
        req.reject();
        console.log((new Date()) + ' Connection from origin ' + req.origin + ' has been rejected.');
        return;
    }

    var connection = req.accept('echo-protocol', req.origin);
    console.log((new Date()) + ' Connection accepted.');

    var user: User = {
        sessionID: getNewSessionID(),
        connection: connection
    }

    users.push(user);

    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            var MessageData: ServerEvent = JSON.parse(message.utf8Data);
            if (MessageData.Data.Sender === "SERVER") return console.log(`Data Sender "Server". Cannot Parse.`);
            if (MessageData.Data.Type === "REQUEST") {
                switch (MessageData.Data.Demand) {
                    case "MESSAGE":
                        console.log("Message Request Received.");
                        break;
                    case "VERSION":
                        break;
                    default:
                        console.log(`Unknown Demand "${MessageData.Data.Demand}".`);
                        break;
                }
            } else if (MessageData.Data.Type === "SEND") {
                switch (MessageData.Data.Demand) {
                    case "MESSAGE":
                        console.log(`Received Message: "${MessageData.Content.toString()}".`);
                        break;
                    case "VERSION":
                        var FixedVersion = VersionFixer(MessageData.Content);
                        CheckUpdate(FixedVersion).then(() => {

                            var data: ServerEvent = {
                                Data: {
                                    Sender: "SERVER",
                                    Type: "SEND",
                                    Demand: "VERSION"
                                },
                                Content: 100
                            }

                            connection.sendUTF(JSON.stringify(data));
                        }).catch((err) => {
                            throw new Error(TranslateError(err));
                        });
                        break;
                }
            } else {
                console.log(`Unsure Data Type of ${MessageData.Data.Type}.`);
            }
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