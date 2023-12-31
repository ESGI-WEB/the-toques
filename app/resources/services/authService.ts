import {jwtDecode} from "jwt-decode";
import {redirect} from "next/navigation";

export interface JWTToken {
    id: number;
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
    // refresh the page
    window.location.reload();
}