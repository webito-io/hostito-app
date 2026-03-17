import { useSettingsContext } from "@/providers/settings/SettingsContext";

export function LogoTypo({ className }: { className?: string }) {

    const { settings } = useSettingsContext();

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className="text-2xl">{settings.brand.name}</span>
        </div>
    )
}