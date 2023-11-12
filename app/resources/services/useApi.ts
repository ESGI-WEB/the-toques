import {getToken} from "../components/AuthCheck";
import {redirect} from "next/navigation";

export const useApi = () => {
    const token = getToken() || null;

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
                return response.json();
            }

            // need to authenticate, redirect to login page
            if (response.status === 401) {
                redirect('/login');
                return;
            }

            return response.json().then(error => {
                throw error;
            });
        });
    }
};