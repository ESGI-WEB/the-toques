"use client";

import {decodeToken} from "@/app/resources/services/authService";
import {useEffect, useState} from "react";
import {redirect, useRouter} from "next/navigation";

export default function AuthCheck ({ children, roles = [] }: { children: any, roles?: string[] }) {
    const [hasVerified, setHasVerified] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = decodeToken();
        if (!token) {
            router.push('/login');
        }

        if (roles.length > 0 && !roles.includes(token.role)) {
            router.push('/login');
        }

        setHasVerified(true);
    }, []);

    return hasVerified ? children : null;
};