import { getServerSession } from "next-auth";
import { ReactNode } from "react";
import { nextAuthOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

interface PrivateLayoutProps {
    children: ReactNode;
}

const allowedRoles = ["TRIAGEM"];

export default async function TriageLayout({ children }: PrivateLayoutProps) {
    const session = await getServerSession(nextAuthOptions)

    // 2º camada de proteção: sem sessão → login
    if (!session) {
        redirect('/')
    }

    // 3º camada de proteção: papel não autorizado → login
    if (!allowedRoles.includes(session.user.papel)) {
        redirect('/')
    }

    return (
        <>
            {children}
        </>
    )
}
