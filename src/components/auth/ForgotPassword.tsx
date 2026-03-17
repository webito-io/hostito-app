'use client'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { useAuthContext } from "@/providers/auth/AuthContext"

export function ForgotPassword() {

    const router = useRouter();

    const { forgotPassword } = useAuthContext();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await forgotPassword(email);
            toast.success('Password reset link sent successfully');
            setIsSent(true);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    if (isSent) {
        return (
            <Card className="w-full max-w-sm mx-auto">
                <CardHeader>
                    <CardTitle>Check your email</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">We sent a reset link to {email}. Please check your inbox and spam folder.</p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={() => router.push('/auth/login')}>
                        Back to Login
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-sm mx-auto">
            <CardHeader>
                <CardTitle>Forgot your password?</CardTitle>
                <CardDescription>
                    Enter your email below to reset your password
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <div className="text-xs text-start block w-full text-muted-foreground mt-1">
                    You can go back to{" "}
                    <a
                        onClick={() => router.push('/auth/login')}
                        className="underline underline-offset-4 transition-colors hover:text-primary cursor-pointer ml-1"
                    >
                        Login
                    </a>
                </div>
            </CardFooter>
        </Card>
    )
}