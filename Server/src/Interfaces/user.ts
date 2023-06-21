import { connection } from "websocket";

export interface user {
    sessionID: string
    userData?: undefined
    connection: connection
}