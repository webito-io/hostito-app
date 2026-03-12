
export function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="container mx-auto items-center flex flex-row h-screen">
            {children}
        </div>
    )
}

export default AuthLayout;