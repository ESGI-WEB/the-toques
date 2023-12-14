"use client";

import {decodeToken} from "@/app/resources/services/authService";
import {redirect, useRouter} from "next/navigation";
import {useEffect, useState} from "react";

export default function NotAuthCheck ({ children }: { children: any }) {
    const [hasVerified, setHasVerified] = useState(false);
    const router = useRouter();
    useEffect(() => {
        const token = decodeToken();
        if (token) {
            router.push('/');
        }
        setHasVerified(true);
    }, []);

    return hasVerified ? children : null;
}