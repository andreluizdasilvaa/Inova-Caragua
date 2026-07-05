import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextAuthSessionProvider from "@/providers/sessionProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Inova Caragua - Sistema de Gestão",
    description: "Sistema de Gestão de Inventário e Ocorrências da Prefeitura de Caraguatatuba",
    icons: {
        icon: "/logo_ico.ico", 
    },
};

import { NotificationProvider } from "@/components/layout/NotificationContext";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <NextAuthSessionProvider>
                    <NotificationProvider>
                        {children}
                    </NotificationProvider>
                </NextAuthSessionProvider>
            </body>
        </html>
    );
}