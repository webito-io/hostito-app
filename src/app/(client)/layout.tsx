import { AuthGuard } from "@/guards/AuthGuard";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            {children}
        </AuthGuard>
    )
}

export default ClientLayout;