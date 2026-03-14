'use client'

import { Progress } from "@/components/ui/progress";
import { useAuthContext } from "@/providers/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {


    const { user, loading: authLoading } = useAuthContext();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [value, setValue] = useState(20);

    useEffect(() => {

        if (authLoading) {
            return;
        }

        if (!user) {

            console.log('user not found', user);
            setValue(60);
            setTimeout(() => {
                router.push('/auth/login');
            }, 1000);
        } else {
            if (!user.emailVerified) {
                router.push('/auth/verify-email');
            }
            setValue(100);
            setLoading(false);
        }

        return () => {
        }

    }, [user, authLoading]);


    if (loading) {
        return <div className="flex items-center justify-center h-screen">
            <Progress value={value} className="w-[200px]" />
        </div>
    }

    return children;
}