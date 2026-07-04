import { getServerSession } from "next-auth";
import { ReactNode } from "react";
import { nextAuthOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

interface PrivateLayoutProps {
    children: ReactNode;
}

/**
 * Papéis que podem acessar as rotas /admin
 */
const allowedRoles = ["MESTRE", "TRIAGEM"];

// Quem não tem uma sessão ativa vai ser redirecionado para page de login
export default async function PrivateLayout({ children }: PrivateLayoutProps) {
    const session = await getServerSession(nextAuthOptions)

    // 2º camada de proteção: sem sessão → login
    if (!session) {
        redirect('/login')
    }

    // 3º camada de proteção: papel não autorizado → login
    if (!allowedRoles.includes(session.user.papel)) {
        redirect('/login')
    }

    return (
        <>
            {children}
        </>
    )
}
