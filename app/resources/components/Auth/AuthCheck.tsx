"use client";

import {decodeToken} from "@/app/resources/services/authService";
import {useEffect, useState} from "react";
import {redirect} from "next/navigation";

export default function AuthCheck ({ children, roles = [] }: { children: any, roles?: string[] }) {
    const [hasVerified, setHasVerified] = useState(false);

    useEffect(() => {
        const token = decodeToken();
        if (!token) {
            redirect('/login');
        }

        if (roles.length > 0 && !roles.includes(token.role)) {
            redirect('/login');
        }

        setHasVerified(true);
    }, []);

    return hasVerified ? children : null;
};