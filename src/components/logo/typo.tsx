import { useSettingsContext } from "@/providers/settings/SettingsContext";

export function LogoTypo() {

    const { settings } = useSettingsContext();

    return (
        <div className="flex items-center gap-2">
            <span className="text-2xl">{settings.brand.name}</span>
        </div>
    )
}