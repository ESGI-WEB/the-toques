"use client";

import {ThemeProvider} from "@mui/system";
import {theme} from "@/app/resources/theaming";
import Header from "@/app/resources/components/Header";

export default function App(props: any) {
    return (
        <ThemeProvider theme={theme}>
            <Header/>
            <div className="padding-40">
                {props.children}
            </div>
        </ThemeProvider>
    )
}
