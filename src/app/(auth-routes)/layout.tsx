import { getServerSession } from "next-auth";
import { ReactNode } from "react";
import { nextAuthOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

interface PrivateLayoutProps {
    children: ReactNode;
}

// Quem tem uma sessão ativa vai ser redirecionado para (admin-routes)
export default async function AuthLayout({ children }: PrivateLayoutProps) {
    const session = await getServerSession(nextAuthOptions)

    if(session) {
        redirect('/admin')
    }

    return (
        <>
            {children}
        </>
    )
}