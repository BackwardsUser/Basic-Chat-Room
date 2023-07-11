import { Version } from "../types"

interface AppSettings {
    VERSION: Version
    NIGHTLY_VERSION: Version
}

export interface Config {
    APP_SETTINGS: AppSettings
}