import { ResetPassword } from "@/components/auth/ResetPassword";
import { Suspense } from "react";

export const metadata = {
    title: "Reset Password",
    description: "Reset your password",
}

export function ResetPasswordPage() {
    return (
        <ResetPassword />
    )
}

export default ResetPasswordPage;