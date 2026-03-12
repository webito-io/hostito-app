"use client";

import { createContext, useContext } from "react";
import { SettingsContextType } from "@/types/settings";

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettingsContext = () => {

    const context = useContext(SettingsContext);

    if (!context) {
        throw new Error("useSettingsContext must be used within an SettingsProvider");
    }

    return context;
}

export default SettingsContext;