'use client'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { useAuthContext } from "@/providers/auth/AuthContext"
import { useState } from "react"
import { toast } from "sonner"

export function VerifyEmail() {

    const { logout, verifyEmail, resendVerificationEmail, user } = useAuthContext();

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const handleResend = async () => {
        setIsResending(true);
        try {
            await resendVerificationEmail();
            toast.success('Verification code sent successfully');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsResending(false);
        }
    }

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await verifyEmail(otp);
            toast.success('Email verified successfully');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-sm mx-auto">
            <CardHeader>
                <CardTitle>Verify your email</CardTitle>
                <CardDescription>
                    Enter the verification code we sent to your email address:{" "}
                    <span className="font-medium text-primary">{user?.email}</span>.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Field>
                    <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="otp-verification">
                            Insert the code below
                        </FieldLabel>
                        {/* <Button variant="outline" size="xs">
                            <RefreshCwIcon />
                            Resend Code
                        </Button> */}
                    </div>
                    <InputOTP maxLength={6} id="otp-verification" value={otp} onChange={setOtp} onComplete={handleSubmit} required>
                        <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-13 *:data-[slot=input-otp-slot]:text-xl">
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator className="mx-2" />
                        <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-13 *:data-[slot=input-otp-slot]:text-xl">
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                    <FieldDescription>
                        {isResending ? 'Resending...' : <a onClick={handleResend} className="cursor-pointer">Resend code</a>}
                    </FieldDescription>
                </Field>
            </CardContent>
            <CardFooter>
                <Field>
                    <Button className="w-full" onClick={() => handleSubmit()} disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify'}
                    </Button>
                    <div className="text-xs text-muted-foreground mt-1">
                        Having trouble signing in?{" "}
                        <a
                            href="#"
                            className="underline underline-offset-4 transition-colors hover:text-primary mr-1"
                        >
                            Contact support
                        </a>
                        or
                        <a
                            onClick={() => logout()}
                            className="underline underline-offset-4 transition-colors hover:text-primary cursor-pointer ml-1"
                        >
                            Logout
                        </a>
                    </div>
                </Field>
            </CardFooter>
        </Card>
    )
}
