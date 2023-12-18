"use client";

import {decodeToken, JWTToken} from "@/app/resources/services/authService";
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

        const securedToken = token as JWTToken;
        if (roles.length > 0 && !roles.includes(securedToken.role)) {
            router.push('/login');
        }

        setHasVerified(true);
    }, []);

    return hasVerified ? children : null;
};