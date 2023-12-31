import './globals.css'
import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import App from "@/app/resources/components/App";

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
    title: 'CuisineConnect | Des recettes de cuisine totalement toqués',
    description: 'Recherche tes recettes de cuisine préférées.',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <App>
            {children}
        </App>
        </body>
        </html>
    )
}
