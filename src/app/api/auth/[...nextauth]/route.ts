import { authenticate } from "@/app/actions/auth/login"
import NextAuth, { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"

const nextAuthOptions: NextAuthOptions = {
    // Todos os providers de autenticação que você pode usar(email e senha, google, github...)
    providers: [
        Credentials({
            // nome desse provider
            name: "credentials",
            // Quais dados você vai receber para fazer login
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },

            // Aqui é onde vamos fazer a autenticação, podendo daqui fazer uma req para sua api e na sua api verificar no banco de dados o usuário e fazer todo o tratamento, ou fazer essa busca no DB por aqui mesmo, pelo next ser server side é possivel
            // essa função recebe credentials = dados que enviado para o login(email e senha nesse caso) e o req dados da requisição
            async authorize(credentials) {
                // Você pode chamar sua api e retornar o que o que ela retornou ou
                // const response = await fetch("http://localhost:3000/api/login")

                // Criar uma função em /lib/auth/login.ts que vai ter a logica de authenticação(como um controller)
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                return await authenticate({
                    email: credentials.email,
                    password: credentials.password,
                })
            }
        })
    ],
    // Onde fica a pagina de LOGIN
    pages: {
        signIn: "/"
    },
    session: {
        strategy: "jwt",
        maxAge: 60 * 60, // 1 hora
        updateAge: 15 * 60  // 15 minutos
    },
    jwt: {
        maxAge: 60 * 60, // 1 hora
    },
    callbacks: {

        // Onde roda: Sempre no servidor
        // Quando roda: Em TODA requisição que usa autenticação
        // Propósito: Controlar o que é armazenado no JWT (o cookie criptografado)
        async jwt({ token, user }) {
            if (user) {
                token.userId = user.id as string; 
                token.email = user.email as string;
                token.name = user.name as string;
                token.papel = (user as any).papel as string;
            }
            return token;
        },

        // Onde roda: Servidor E cliente
        // Quando roda: Quando você chama getServerSession() ou useSession()
        // Propósito: Transformar o token em objeto acessível no código
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.userId as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.papel = token.papel as string;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET, // Onde está a env para criptografar os tokens
    useSecureCookies: process.env.NODE_ENV === 'production', // para forçar conexão https quando estiver em produção
}

const handler = NextAuth(nextAuthOptions)

export { handler as GET, handler as POST, nextAuthOptions }