import { AuthGuard } from "@/guards/AuthGuard";

export function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            {children}
        </AuthGuard>
    )
}

export default AdminLayout;