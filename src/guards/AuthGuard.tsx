'use client'

import { Progress } from "@/components/ui/progress";
import { useAuthContext } from "@/providers/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {


    const { user } = useAuthContext();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [value, setValue] = useState(20);

    useEffect(() => {
        if (!user) {
            setValue(60);
            setTimeout(() => {
                router.push('/auth/login');
            }, 1000);
        } else {
            setValue(100);
            setLoading(false);
        }
    }, [user]);


    if (loading) {
        return <div className="flex items-center justify-center h-screen">
            <Progress value={value} className="w-[200px]" />
        </div>
    }

    return children;
}