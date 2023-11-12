"use client";
import * as React from 'react';
import {theme} from "@/app/resources/theaming";
import {ThemeProvider} from "@mui/system";
import AuthCheck from "@/app/resources/components/AuthCheck";

export default function Profile() {
    return (
        <AuthCheck>
            <ThemeProvider theme={theme}>
                <p>Profile page</p>
            </ThemeProvider>
        </AuthCheck>
    );
}