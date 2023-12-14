import {redirect, useRouter} from "next/navigation";
import {getToken} from "@/app/resources/services/authService";

export const useApi = () => {
    const token = getToken() || null;
    const router = useRouter();

    return (url: any, options: any = {}) => {
        const headers = {
            ...options.headers,
        };

        if (token && !options.headers?.Authorization) {
            headers.Authorization = `Bearer ${token}`;
        }

        if (options.body && typeof options.body !== 'string') {
            options.body = JSON.stringify(options.body);
        }

        headers['Content-Type'] = headers['Accept'] = 'application/json';

        return fetch(`/api/${url}`, {...options, headers}).then(response => {
            if (response.ok) {
                if (response.status === 204) {
                    return;
                }
                return response.json();
            }

            // need to authenticate, redirect to login page
            if (response.status === 401) {
                router.push('/login');
                return;
            }

            return response.json().then(error => {
                throw error;
            });
        });
    }
};