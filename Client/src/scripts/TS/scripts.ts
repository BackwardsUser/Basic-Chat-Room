import { ErrorCodes } from "./ErrorCodes";
import { ErrorCode } from "../../Interfaces";

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