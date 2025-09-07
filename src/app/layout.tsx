import type {Metadata} from "next";
import "../styles/globals.css";
import {ReactNode} from "react";
import {Open_Sans} from 'next/font/google';
import {Toaster} from "react-hot-toast";

export const metadata: Metadata = {
    title: "The Adamant",
    description: "Firm in Vision. Bold in Action",
};

const openSans = Open_Sans({
    subsets: ['latin'],
    weight: ['400', '700'],
    fallback: ['Arial', 'sans-serif'],
});

export default function RootLayout({children}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={openSans.className}>

        <Toaster
            position="top-right"
            reverseOrder={false}
            containerClassName="mt-14"/>

        {children}

        </body>
        </html>
    );
}
