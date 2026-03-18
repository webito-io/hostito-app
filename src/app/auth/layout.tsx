import { Progress } from "@/components/ui/progress";
import { Suspense } from "react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={(
            <div className="container mx-auto items-center flex flex-row h-screen">
                <Progress value={50} />
            </div>
        )}>
            <div className="container mx-auto items-center flex flex-row h-screen">
                {children}
            </div>
        </Suspense>
    )
}

export default AuthLayout;