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
 * Função principal do middleware
 * Executa APENAS se o usuário passou na verificação do callback "authorized"
 * Use para lógica adicional como logging, validações extras, ou modificar response
 */
function middleware(req: NextRequestWithAuth) {
    // Extrair informações úteis da requisição
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    
    // ===== EXEMPLOS DE DADOS DISPONÍVEIS NO TOKEN =====
    // token.sub       → ID do usuário
    // token.email     → Email do usuário (adicionado no callback jwt)
    // token.name      → Nome do usuário(adicionado no callback jwt)
    // token.userId    → ID customizado (adicionado no callback jwt)
    // token.iat       → Data de criação do token
    // token.exp       → Data de expiração do token

    console.log("Usuário autenticado acessou rota protegida")
    console.log(`Rota: ${path}`)
    console.log(`Email: ${token?.email}`)
    
    // ===== EXEMPLOS DE LÓGICA QUE VOCÊ PODE ADICIONAR =====
    
    // 1. VALIDAR ROLES/PERMISSÕES
    // if (path.startsWith("/admin") && token?.role !== "admin") {
    //   return NextResponse.redirect(new URL("/unauthorized", req.url))
    // }
    
    // 2. BLOQUEAR ACESSO A ROTAS ESPECÍFICAS
    // if (path === "/admin/users/delete") {
    //   console.warn("❌ Tentativa não autorizada de deletar usuários")
    //   return NextResponse.redirect(new URL("/forbidden", req.url))
    // }
    
    // 3. REGISTRAR AUDITORIA
    // await auditLog({
    //   userId: token?.sub,
    //   action: "page_access",
    //   resource: path,
    //   timestamp: new Date()
    // })
    
    // 4. MODIFICAR HEADERS DA RESPOSTA
    // const response = NextResponse.next()
    // response.headers.set("X-User-ID", token?.sub as string)
    // return response
    
    // Permitir a requisição continuar para a página
    return NextResponse.next()
}

export default withAuth(middleware, {
    /**
     * ===== CALLBACKS =====
     * Funções que controlam o fluxo de autenticação
     */
    callbacks: {
        authorized: ({ token, req }) => {
            // ===== EXEMPLOS DE VALIDAÇÕES =====
            
            // 1. APENAS USUÁRIOS AUTENTICADOS
            // return !!token
            
            // 2. APENAS ADMINS
            // return token?.role === "admin"
            
            // 3. APENAS EMAIL ESPECÍFICO
            // return token?.email === "admin@exemplo.com"
            
            // 4. EMAIL VERIFICADO
            // return token?.email === "teste@teste.com" && token?.emailVerified === true
            
            // 5. VALIDAR MÚLTIPLAS CONDIÇÕES
            // if (!token) return false
            // if (token.role !== "admin") return false
            // if (token.suspended === true) return false
            // return true
            
            // ATUAL: Qualquer usuário autenticado (tem token) pode acessar
            return !!token
        },
    },
    pages: {
        // Rota de login (quando usuário não autenticado tenta acessar rota protegida)
        signIn: "/login",
        // Opcional: página de erro
        // error: "/auth/error",
    },
})

/**
 * ===== MATCHER =====
 * Define QUAIS rotas este middleware deve proteger
 * Usa padrão de glob pattern do Next.js
 * 
 * A requisição só passa pelo middleware se bater em um desses padrões
 */
export const config = {
    matcher: [
        // Protege TODA a rota /admin e subrotas
        "/admin/:path*",
        
        // EXEMPLOS DE OUTROS PADRÕES:
        // "/dashboard",                    // Apenas /dashboard
        // "/dashboard/:path*",             // /dashboard e todas as subrotas
        // "/api/protected/:path*",         // Protege API routes
        // "/(admin|dashboard)/:path*",     // Múltiplas rotas com OU
        // "/((?!login|register|public).*)" // Protege TUDO exceto login, register, public
        
        // ROTAS QUE NÃO DEVEM SER PROTEGIDAS (deixe comentado):
        // - /login
        // - /register
        // - /api/auth/*  (Next-auth já protege automaticamente)
        // - /public/*
    ]
}

/**
 * ===== NOTAS DE SEGURANÇA =====
 *
 * - Usar NEXTAUTH_SECRET robusta (mínimo 32 caracteres)
 * - Validar token no servidor SEMPRE
 * - Usar matcher para proteger rotas sensíveis
 * - Redirecionar para /login se não autenticado
 * 
 * ===== LIMITAÇÕES CONHECIDAS =====
 * - Middleware roda APENAS com estratégia JWT
 * - Para database sessions, use getServerSession() em Server Components
 * - Não pode acessar banco de dados direto no middleware (edge runtime)
 */