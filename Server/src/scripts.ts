import { ErrorCodes } from "./ErrorCodes";
import { ErrorCode } from "./Interfaces";
import { Content, Version } from "./types";

/**
 * @BackwardsUser
 * @description A simple comparison function to compare server and client versions.
 * @param ClientVersion Version of Client
 * @param ServerVersion Version of Server
 * @returns Whether the Client needs to update. Returns Null if Client > Server
 */
export function CompareVersions(ClientVersion: Version, ServerVersion: Version): boolean | number {
    var SplitClientVersion = ClientVersion.split(".");
    var SplitServerVersion = ServerVersion.split(".");

    // Versioning System is based on Major:Minor:Patch and we can assume that there will be 3 numbers in the above vars
    if (SplitClientVersion.length > 3) return null; // Verifying in the case users tamper with their version (Unlikely)
    if (SplitServerVersion.length > 3) return null; // Verifying I don't mess anything up.

    var ClientOutdated: boolean | number = true;

    for (var i = 0; i <= 3; i++) {
        if (SplitClientVersion[i] < SplitServerVersion[i]) ClientOutdated = false
        else if (SplitClientVersion[i] == SplitServerVersion[i]) ClientOutdated = true
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

export function VersionFixer(Version: Content | string): Version {
    // EWW AN ANY!!
    // I have to turn this array from an array of strings to an array of numbers.
    // Hopefully this fixes the issue with my Interface.
    if (typeof Version !== "string") return null;
    var SplitVersion: any[] = Version.split(".");
    return `${SplitVersion[0]}.${SplitVersion[1]}.${SplitVersion[2]}`;
}