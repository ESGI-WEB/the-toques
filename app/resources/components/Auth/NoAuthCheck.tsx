"use client";

import {decodeToken} from "@/app/resources/services/authService";
import {redirect} from "next/navigation";
import {useEffect, useState} from "react";

export default function NotAuthCheck ({ children }: { children: any }) {
    const [hasVerified, setHasVerified] = useState(false);
    useEffect(() => {
        const token = decodeToken();
        if (token) {
            redirect('/');
        }
        setHasVerified(true);
    }, []);

    return hasVerified ? children : null;
}