/**
 * MIDDLEWARE DE AUTENTICAÇÃO - Next.js 13+ (App Router)
 * 
 * ===== O QUE É =====
 * Middleware é código que executa ANTES de qualquer requisição chegar à sua aplicação.
 * Roda no EDGE (servidores da Vercel, Netlify, etc) ou no servidor Node.js
 * 
 * ===== PROPÓSITO =====
 * Proteger rotas exigindo autenticação ANTES de renderizar a página
 * Verificar permissões/roles antes de acessar recursos
 * Registrar acessos para auditoria
 * 
 * ===== FLUXO DE EXECUÇÃO =====
 * 1. Usuário tenta acessar /admin
 * 2. Middleware intercepta a requisição
 * 3. Callback "authorized" é executado - Decide: usuário pode acessar?
 *    - Se NÃO tem token → Redireciona para /login
 *    - Se tem token → Continua para função middleware()
 * 4. Função middleware() executa lógica adicional
 * 5. NextResponse.next() permite página renderizar (ou NextResponse.redirect() bloqueia)
 * 
 * ===== IMPORTANTE =====
 * - Só protege rotas definidas em "matcher"
 * 
 * Documentação: https://next-auth.js.org/configuration/nextjs#middleware
 */

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequestWithAuth } from "next-auth/middleware"

/**
 * Mapa de rotas → papéis permitidos
 * Adicione novas rotas e papéis aqui conforme o sistema crescer
 */
const roleRouteMap: Record<string, string[]> = {
    "/admin": ["MESTRE"],
    "/school": ["ESCOLA"],
    "/triagem": ["TRIAGEM"],
}

/**
 * Função principal do middleware
 * Executa APENAS se o usuário passou na verificação do callback "authorized"
 */
function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Encontrar qual rota protegida corresponde ao path atual
    const matchedRoute = Object.keys(roleRouteMap).find((route) =>
        path.startsWith(route)
    )

    if (matchedRoute) {
        const allowedRoles = roleRouteMap[matchedRoute]
        const userRole = token?.papel

        // Se o papel do usuário não está na lista de permitidos → redireciona
        if (!userRole || !allowedRoles.includes(userRole)) {
            console.warn(
                `❌ Acesso negado: ${token?.email} (papel: ${userRole}) tentou acessar ${path}`
            )
            return NextResponse.redirect(new URL("/", req.url))
        }
    }

    return NextResponse.next()
}

export default withAuth(middleware, {
    callbacks: {
        authorized: ({ token }) => {
            // Qualquer usuário autenticado (tem token) pode passar para o middleware
            return !!token
        },
    },
    pages: {
        signIn: "/",
    },
})

/**
 * ===== MATCHER =====
 * Define QUAIS rotas este middleware deve proteger
 * Usa padrão de glob pattern do Next.js
 */
export const config = {
    matcher: [
        // Protege TODA a rota /admin e subrotas
        "/admin/:path*",
        // Protege TODA a rota /school e subrotas
        "/school/:path*",
        // Protege TODA a rota /triagem e subrotas
        "/triagem/:path*",
    ],
}