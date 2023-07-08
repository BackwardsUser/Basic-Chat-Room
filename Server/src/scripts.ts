import { ErrorCodes } from "./ErrorCodes";
import { ErrorCode } from "./Interfaces";
import { Version } from "./types";

/**
 * @BackwardsUser
 * @description A simple comparison function to compare server and client versions.
 * @param ClientVersion Version of Client
 * @param ServerVersion Version of Server
 * @returns Whether the Client needs to update. Returns Null if Client > Server
 */
export function CompareVersions(ClientVersion: Version, ServerVersion: Version): boolean | number {
    var SplitClientVersion = ClientVersion.split(":");
    var SplitServerVersion = ServerVersion.split(":");

    // Versioning System is based on Major:Minor:Patch and we can assume that there will be 3 numbers in the above vars
    if (SplitClientVersion.length > 3) return null; // Verifying in the case users tamper with their version (Unlikely)
    if (SplitServerVersion.length > 3) return null; // Verifying I don't mess anything up.

    var ClientOutdated: boolean | number = false;

    for (var i = 0; i <= 3; i++) {
        if (SplitClientVersion[i] < SplitServerVersion[i]) ClientOutdated = true
        else if (SplitClientVersion[i] == SplitServerVersion[i]) ClientOutdated = false
        else ClientOutdated = 300;
    }

    return ClientOutdated;
}

/**
 * @BackwardsUser
 * @description A Function to translate custom Error Codes.
 * @param ErrorCode The Error Code to Translate
 * @returns A Text Version of the Error
 * @requires ErrorCodes.ts - Essentially my Error Code Dictionary.
 */
export function TranslateError(Code: number): string {
    return ErrorCodes.filter((ECode: ErrorCode) => ECode.Code === Code)[0].Error;
}