// Logica de autenticação (Login):

import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

type AuthenticateProps = {
    email: string;
    password: string;
};

export async function authenticate({
    email,
    password,
}: AuthenticateProps) {

    try {
        const user = await prisma.usuario.findUnique({
            where: { email },
        });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(password, user.senhaHash);

        if (!passwordMatch) return null;

        return {
            id: user.id,
            email: user.email,
            name: user.nome,
        };
    } catch {
        return null;
    }
}