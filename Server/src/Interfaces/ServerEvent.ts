import { EventSender, EventType, EventDemand, Content } from "../Types";

interface Data {
    Sender: EventSender
    Type: EventType
    Demand: EventDemand
}

export interface ServerEvent {
    Data: Data
    Content: Content
}