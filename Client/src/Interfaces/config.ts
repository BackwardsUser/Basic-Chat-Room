interface WebsocketSettings {
    WS_HOST: `ws://${string}`
}

interface AppSettings {
    VERSION: `${number}.${number}.${number}`
}

export interface Config {
    HARDWARE_ACCELERATION: boolean
    MAXIMUM_REATTEMPTS: number
    TIME_TO_NEXT_STEP: number
    WEBSOCKET_SETTINGS: WebsocketSettings
    APP_SETTINGS: AppSettings
}