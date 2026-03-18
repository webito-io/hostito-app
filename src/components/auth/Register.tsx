'use client'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuthContext } from "@/providers/auth/AuthContext"
import { RegisterUser } from "@/types/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

export function Register() {

    const router = useRouter();

    const { register } = useAuthContext();

    const { register: registerForm, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterUser>({
        resolver: zodResolver(
            z.object({
                firstName: z.string().optional(),
                lastName: z.string().optional(),
                email: z.string().email('Invalid email'),
                password: z.string().min(6, 'Password must be at least 6 characters long'),
            })
        ),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
        },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    });

    const onSubmit = async (data: RegisterUser) => {
        try {
            await register(data);
            toast.success('Register successful');
            router.push('/auth/verify-email');
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <Card className="w-full max-w-sm mx-auto">
            <form onSubmit={handleSubmit(onSubmit)}>

                <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>
                        Enter your information below to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                            <Input id="firstName" type="text" placeholder="John" required {...registerForm('firstName')} />
                            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                            <Input id="lastName" type="text" placeholder="Doe" required {...registerForm('lastName')} />
                            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                {...registerForm('email')}
                            />
                            <FieldDescription>
                                We&apos;ll use this to contact you. We will not share your email
                                with anyone else.
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <Input id="password" type="password" required {...registerForm('password')} />
                            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                        </Field>
                        <FieldGroup>
                            <Field className="flex flex-col gap-4">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Registering...' : 'Register'}
                                </Button>
                                {/* <Button variant="outline" type="button">
                                    Sign up with Google
                                </Button> */}
                                <FieldDescription className="text-xs w-full text-start ">
                                    Already have an account? <a className="underline-offset-4 hover:underline cursor-pointer" onClick={() => router.push('/auth/login')}>Sign in</a>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </FieldGroup>
                </CardContent>
            </form>
        </Card>
    )
}