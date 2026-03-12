export type SettingsContextType = {
    settings: Settings;
    setSettings: (settings: Settings) => void;
}

export type Settings = {
    brand: {
        name: string;
        logo: string;
    };
    theme: string;
    language: string;
    currency: string;
}