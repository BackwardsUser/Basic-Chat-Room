var ErrorCodes = [

    // General Codes
    { Code: 100, Error: "Successful" /* Not too necessary. Also not an -Error- Code, but we won't talk about it. */ },

    // Version Error Codes
    { Code: 360, Error: "Client Version > Server Version" }, { Code: 391, Error: "Provided Version isn't a String" },

    // Download Error Codes
    { Code: 470, Error: "Failed to Retrieve Updated Download" }, { Code: 461, Error: "Update of Same Version of Client" },
    { Code: 472, Error: "Download Older than Client" }, { Code: 443, Error: "Couldn't Send Download to Client" },
    { Code: 434, Error: "Client Failed to Install Update" },

    // Websocket Error Codes
    { Code: 590, Error: "Websocket Failed to Connect" }, { Code: 551, Error: "Websocket Connection Failed" },
    { Code: 512, Error: "Websocket Connection Terminated" }, { Code: 593, Error: "Websocket Connection Invalid" },
    { Code: 564, Error: "Too many Websocket Requests." }
]

/**
 * @BackwardsUser
 * @description A Function to translate custom Error Codes.
 * @param ErrorCode The Error Code to Translate
 * @returns A Text Version of the Error
 * @requires ErrorCodes.ts - Essentially my Error Code Dictionary.
 */
function TranslateError(Code) {
    return ErrorCodes.filter((ECode) => ECode.Code === Code)[0].Error;
}

module.exports.TranslateError = TranslateError;