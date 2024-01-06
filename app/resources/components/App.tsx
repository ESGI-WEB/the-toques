"use client";

import 'regenerator-runtime/runtime';
import {ThemeProvider} from "@mui/system";
import {theme} from "@/app/resources/theaming";
import Header from "@/app/resources/components/Header";
import ChatBot from "@/app/resources/components/ChatBot";

export default function App(props: any) {
    return (
        <ThemeProvider theme={theme}>
            <Header/>
            <div className="padding-40 full-v-height">
                {props.children}
            </div>
            <ChatBot/>
        </ThemeProvider>
    )
}
