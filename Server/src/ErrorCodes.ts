import { ErrorCode } from "./Interfaces";

export var ErrorCodes: ErrorCode[] = [

    // General Codes
    { Code: 100, Error: "Successful" /* Not too necessary. Also not an -Error- Code, but we won't talk about it. */},

    // Version Error Codes
    { Code: 360, Error: "Client Version > Server Version"}, { Code: 391, Error: "Provided Version isn't a String"},

    // Download Error Codes
    { Code: 470, Error: "Failed to Retrieve Updated Download"}, { Code: 461, Error: "Update of Same Version of Client"},
    { Code: 472, Error: "Download Older than Client"}, { Code: 443, Error: "Couldn't Send Download to Client"},
    { Code: 434, Error: "Client Failed to Install Update" },

    // Websocket Error Codes
    { Code: 590, Error: "Websocket Failed to Connect" }, { Code: 551, Error: "Websocket Connection Failed" },
    { Code: 512, Error: "Websocket Connection Terminated" }, { Code: 593, Error: "Websocket Connection Invalid" },
    { Code: 564, Error: "Too many Websocket Requests." }
]

// Quite simply a lot of these errors will have been caught and handled by the code,
// but it is nice to manage them and document their occurrences.

// Code Management

// Code Layout
// xxx

// 1xx - This Indicates where the error originated. Websocket, Download, Version, etc.
// x1x - This Indicated the importance of the Error, The closer to 1 the less of an issue. ex. 0 - Successful, While: 9 - Websocket Failed to Connect.
// xx1 - This is the error code itself. This is what tells you what the issue was.

// None of this is really necessary, I could make them completely random, but that would be more confusing for me.
// On the other side, This function and array isn't needed with an explanation sheet, but It's nice to keep errors
// documented and accessible, plus it helps users understand what went wrong.