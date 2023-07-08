import { connection } from "websocket";

export interface User {
    sessionID: string
    userData?: undefined
    connection: connection
}