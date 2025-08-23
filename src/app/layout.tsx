import type {Metadata} from "next";
import "../styles/globals.css";
import {ReactNode} from "react";

export const metadata: Metadata = {
    title: "The Adamant",
    description: "Firm in Vision. Bold in Action",
};

export default function RootLayout({children}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en">
        <body>
        {children}
        </body>
        </html>
    );
}
