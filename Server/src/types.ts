// Not -required- for the code, but does help keep things clear.
type EventSender = "CLIENT"
    | "SERVER";

// Again not too important, but does help keep things readable.
type EventType = "SEND"
    | "REQUEST"

// This is the important bit of the Event, it is how the code deciphers what is needed.
type EventDemand = "VERSION"
    | "MESSAGE";

type Content = string
    | number
    | object
    | string[]
    | number[]
    | object[]

type Version = `${number}.${number}.${number}`

export {
    EventSender,
    EventType,
    EventDemand,
    Content,
    Version
}