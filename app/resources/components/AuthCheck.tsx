"use client";
import { useEffect } from 'react';
import {redirect} from "next/navigation";
import {jwtDecode} from "jwt-decode";

export interface JWTToken {
    id: string;
    email: string;
    firstName: string;
    role: string;
}

export const getToken = (): string|false => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return false;
        }
        return JSON.parse(token);
    } catch (e) {
        return false;
    }
}

export const decodeToken = (): JWTToken|false => {
    try {
        const token = getToken();
        if (!token) {
            return false;
        }
        return jwtDecode(token) as JWTToken;
    } catch (e) {
        return false;
    }
};

export const setToken = (token: string) => {
    localStorage.setItem('token', JSON.stringify(token));
};

export const removeToken = () => {
    localStorage.removeItem('token');
    redirect('/');
}

const AuthCheck = ({ children, roles = [] }: { children: any, roles?: string[] }) => {
    useEffect(() => {
        const token = decodeToken();
        if (!token) {
            redirect('/login');
        }

        if (roles.length > 0 && !roles.includes(token.role)) {
            redirect('/login');
        }
    }, []);

    return children;
};

export default AuthCheck;
