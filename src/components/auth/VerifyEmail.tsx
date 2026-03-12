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
import { RefreshCwIcon } from "lucide-react"

export function VerifyEmail() {
    return (
        <Card className="w-full max-w-sm mx-auto">
            <CardHeader>
                <CardTitle>Verify your email</CardTitle>
                <CardDescription>
                    Enter the verification code we sent to your email address:{" "}
                    <span className="font-medium">[EMAIL_ADDRESS]</span>.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Field>
                    <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="otp-verification">
                            Verification code
                        </FieldLabel>
                        {/* <Button variant="outline" size="xs">
                            <RefreshCwIcon />
                            Resend Code
                        </Button> */}
                    </div>
                    <InputOTP maxLength={6} id="otp-verification" required>
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
                        <a href="#">Resend code</a>
                    </FieldDescription>
                </Field>
            </CardContent>
            <CardFooter>
                <Field>
                    <Button type="submit" className="w-full">
                        Verify
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        Having trouble signing in?{" "}
                        <a
                            href="#"
                            className="underline underline-offset-4 transition-colors hover:text-primary"
                        >
                            Contact support
                        </a>
                    </div>
                </Field>
            </CardFooter>
        </Card>
    )
}
