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
import { useAuthContext } from "@/providers/auth/AuthContext"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useCallback } from "react"
import { LoginUser } from "@/types/auth"
import { FieldDescription } from "../ui/field"

export function Login() {

    const router = useRouter();

    const { login } = useAuthContext();


    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginUser>({
        resolver: zodResolver(
            z.object({
                email: z.string().email('Invalid email'),
                password: z.string().min(6, 'Password must be at least 6 characters long'),
            })
        ),
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    });

    const onSubmit = useCallback(async (data: LoginUser) => {
        try {
            await login(data.email, data.password);
            toast.success('Login successful');
            router.push('/');
        } catch (error: any) {
            toast.error(error.message);
        }
    }, [login, router]);


    return (
        <Card className="w-full max-w-sm mx-auto">
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="my-5">
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                {...register('email')}
                            />
                            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                                <a
                                    onClick={() => router.push('/auth/forgot-password')}
                                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline cursor-pointer"
                                >
                                    Forgot your password?
                                </a>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                {...register('password')}
                            />
                            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-3">
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? 'Logging in...' : 'Login'}
                    </Button>
                    <FieldDescription className="text-xs text-start w-full">
                        You don't have an account? <a className="text-xs underline-offset-4 hover:underline cursor-pointer" onClick={() => router.push('/auth/register')}>Sign up</a>
                    </FieldDescription>
                    {/* <Button variant="outline" className="w-full">
                    Login with Google
                </Button> */}
                </CardFooter>
            </form>
        </Card>
    )
}
