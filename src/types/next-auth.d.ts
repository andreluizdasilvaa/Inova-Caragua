import NextAuth from "next-auth";

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            papel: string;
            instituicaoId: string | null;
        }
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        userId: string;
        papel: string;
        instituicaoId: string | null;
    }
}
