'use client'

import { useMemo, useState } from "react";
import SettingsContext from "./SettingsContext"
import { Settings } from "@/types/settings";


export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {

    const [settings, setSettings] = useState<Settings>({
        brand: {
            name: "Hostito",
            logo: "",
        },
        theme: "light",
        language: "en",
        currency: "USD",
    });

    const settingsData = useMemo(() => {
        return {
            settings,
            setSettings,
        }
    }, [settings, setSettings])

    return (
        <SettingsContext.Provider value={settingsData}>
            {children}
        </SettingsContext.Provider>
    )
}