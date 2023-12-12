"use client";
import * as React from 'react';
import {theme} from "@/app/resources/theaming";
import {ThemeProvider} from "@mui/system";
import AuthCheck from "@/app/resources/components/Auth/AuthCheck";

export default function Profile() {
    return (
        <AuthCheck>
            <p>Profile page</p>
        </AuthCheck>
    );
}