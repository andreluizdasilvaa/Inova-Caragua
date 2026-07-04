import { getServerSession } from "next-auth";
import { ReactNode } from "react";
import { nextAuthOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

interface PrivateLayoutProps {
    children: ReactNode;
}

// Quem não tem uma sessão ativa vai ser redirecionado para page de login
export default async function PrivateLayout({ children }: PrivateLayoutProps) {
    const session = await getServerSession(nextAuthOptions)

    // uma 2º camada de proteção alem do middleware
    if(!session) {
        redirect('/login')
    }

    return (
        <>
            {children}
        </>
    )
}