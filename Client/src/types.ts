/* EVENT TYPING */

// The Event Sender
// Helps Identify who is calling the Event.
type EventSender = "CLIENT"
    | "SERVER";

// The Event Type
// Helps Identify what the Event is attempting do do (Send or Request Data/Information)
type EventType = "SEND"
    | "REQUEST"

// The Event Demand
// Informs what the Event needs, whether its sending Message Data, Version Data, etc. or if it needs it.
type EventDemand = "VERSION"
    | "MESSAGE";

// The Content Itself
// This is the stuff that will be sent with the event. Now this could just be "any"
// however its better to keep things organized to prevent from sending information my code isn't to certain of.
type Content = string
    | number
    | object
    | string[]
    | number[]
    | object[]


/* Exports */

export {
    EventSender,
    EventType,
    EventDemand,
    Content
}