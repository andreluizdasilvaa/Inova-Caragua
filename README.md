# Sistema de Gestão Inova-Caragua

Um sistema completo de gestão de inventário e ocorrências, com autenticação pronta para uso com **Next.js 16**, **NextAuth.js 4** e **Prisma ORM**, banco de dados PostgreSQL e styling com Tailwind CSS.

## 📋 Índice

- [Características](#características)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
│   ├── app/
│   │   ├── api/auth/[...nextauth]/route.ts
│   │   ├── actions/auth/
│   │   │   ├── login.ts
│   │   │   ├── password-reset.ts
│   │   │   ├── password-reset-tokens.ts
│   │   │   └── register.ts
│   │   ├── (admin-routes)/admin/page.tsx
│   │   ├── (auth-routes)/
│   │   │   ├── forgot-password/
│   │   │   │   ├── _components/forgot-password-form.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── reset-password/
│   │   │       ├── _components/reset-password-form.tsx
│   │   │       └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/buttonLogout.tsx
│   ├── generated/
│   │   ├── client.ts
│   │   └── models/
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── login.ts
│   │   │   └── register.ts
│   │   ├── prisma.ts
│   │   └── redis.ts
│   ├── mail/
│   │   ├── resend.ts
│   │   └── templates/PasswordResetEmail.tsx
│   ├── providers/sessionProvider.tsx
│   └── types/next-auth.d.ts

### 4. Configure o banco de dados

#### Criar banco de dados PostgreSQL

```sql
-- Abra seu cliente PostgreSQL (psql, pgAdmin, etc)
CREATE DATABASE inova_caragua;
```

#### Execute as migrações Prisma

```bash
npx prisma migrate dev --name init
```

Isso irá:
- Aplicar todas as migrações de banco de dados
- Gerar o cliente Prisma atualizado
- Criar a tabela `users` no seu banco

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## ⚙️ Configuração

### Configurar NextAuth

O NextAuth está configurado em [src/app/api/auth/[...nextauth]/route.ts](src/app/api/auth/%5B...nextauth%5D/route.ts).

**Principais configurações:**

```typescript
// Estratégia de sessão
session: {
    strategy: "jwt",           // Usa JWT em vez de sessão no banco
    maxAge: 60 * 60,          // Sessão expira em 1 hora
    updateAge: 15 * 60        // Atualiza sessão a cada 15 minutos
}

// Página de login
pages: {
    signIn: "/login"          // Redireciona para a página de login para fazer login
}
```

### Adicionar Novos Providers

Para adicionar Google, GitHub ou outro provider de OAuth:

```typescript
// src/app/api/auth/[...nextauth]/route.ts

import GoogleProvider from "next-auth/providers/google"

providers: [
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // ... outros providers
]
```

### Recuperação de Senha

O fluxo de "esqueci minha senha" foi implementado com Server Actions em [src/app/actions/auth/password-reset.ts](src/app/actions/auth/password-reset.ts) e usa Redis para armazenar apenas o hash do token.

Fluxo atual:

1. O usuário acessa [src/app/(auth-routes)/forgot-password/page.tsx](src/app/(auth-routes)/forgot-password/page.tsx) e informa o e-mail.
2. A action `forgotPassword` gera um token criptograficamente seguro, salva somente o hash no Redis e envia o link por e-mail com Resend.
3. O link aponta para [src/app/(auth-routes)/reset-password/page.tsx](src/app/(auth-routes)/reset-password/page.tsx).
4. A action `resetPassword` valida o token, confere a nova senha e atualiza o hash no banco com bcrypt.
5. Em caso de sucesso, a interface aguarda 2 segundos para leitura da mensagem e então redireciona para [src/app/(auth-routes)/login/page.tsx](src/app/(auth-routes)/login/page.tsx).

Regras atuais da senha no reset:

- mínimo de 12 caracteres
- letras maiúsculas
- letras minúsculas
- números
- caracteres especiais

O token expira em 1 minuto via TTL no Redis. Esse tempo foi mantido curto para reduzir risco de abuso e reuso do link.

## 📁 Estrutura do Projeto

```
inova-caragua/
├── src/
│   ├── app/                          # Aplicação Next.js (App Router)
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/   # Rota de autenticação NextAuth
│   │   ├── actions/
│   │   │   └── auth/                  # Server Actions de auth, incluindo reset de senha
│   │   ├── (admin-routes)/           # Rotas protegidas para admins
│   │   │   └── admin/                # Dashboard admin
│   │   ├── (auth-routes)/            # Rotas de autenticação
│   │   │   ├── forgot-password/       # Página de solicitação de reset
│   │   │   ├── login/                # Página de login
│   │   │   └── reset-password/        # Página de redefinição de senha
│   │   │   └── register/              # Página de registro
│   │   ├── globals.css               # Estilos globais
│   │   └── layout.tsx                # Layout raiz com SessionProvider
│   │
│   ├── components/                   # Componentes React reutilizáveis
│   │   └── buttonLogout.tsx          # Botão de logout
│   │
│   ├── mail/                         # Integrações e templates de e-mail
│   │   ├── resend.ts                 # Client do Resend
│   │   └── templates/PasswordResetEmail.tsx  # Template do e-mail de reset de senha
│   │
│   ├── generated/                    # Código gerado pelo Prisma
│   │   ├── client.ts                 # Cliente Prisma gerado
│   │   └── models/                   # Tipos de modelos do banco
│   │
│   ├── lib/                          # Funções utilitárias
│   │   ├── auth/
│   │   │   ├── login.ts              # Lógica de login
│   │   │   └── register.ts           # Lógica de registro
│   │   ├── redis.ts                  # Cliente compartilhado do Upstash Redis
│   │   └── prisma.ts                 # Instância do Prisma Client
│   │
│   ├── app/actions/auth/
│   │   ├── login.ts                  # Lógica de autenticação
│   │   ├── password-reset.ts         # Server Actions de forgot/reset password
│   │   ├── password-reset-tokens.ts  # Helpers do token de reset
│   │   └── register.ts               # Server Action de cadastro
│   ├── providers/                    # Providers React
│   │   └── sessionProvider.tsx       # Provider de sessão
│   │
│   └── types/                        # Tipos TypeScript customizados
│       └── next-auth.d.ts            # Extensão de tipos NextAuth
│
├── prisma/
│   └── schema.prisma                 # Schema do banco de dados
│
├── public/                           # Arquivos estáticos públicos
├── .env.local                        # Variáveis de ambiente (não comitar!)
├── package.json                      # Dependências e scripts
├── tsconfig.json                     # Configuração TypeScript
└── next.config.ts                    # Configuração Next.js
```


## 🔑 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Banco de Dados PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/inova_caragua"

# Conexão direta ao banco, usada por ferramentas e migrações
DIRECT_URL="postgresql://user:password@localhost:5432/inova_caragua"

# NextAuth Secret (gere com: openssl rand -base64 32)
NEXTAUTH_SECRET="sua_chave_secreta_aqui"

# URL da aplicação (importante para produção)
NEXTAUTH_URL="http://localhost:3000"

# (Opcional) Providers OAuth
GOOGLE_CLIENT_ID="seu_id_do_google"
GOOGLE_CLIENT_SECRET="seu_secret_do_google"

# Resend
RESEND_API_KEY=""
RESEND_FROM_EMAIL="Inova Caragua <no-reply@seudominio.com>"

# Upstash Redis
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

```


### Gerar NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Ou no PowerShell:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
```

Essas variáveis são usadas pelo fluxo de recuperação de senha para envio de e-mail e persistência temporária do token.

## 📚 Recursos Úteis

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação NextAuth.js](https://next-auth.js.org)
- [Documentação Prisma](https://www.prisma.io/docs)
- [Documentação Tailwind CSS](https://tailwindcss.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

# Utilize essas credenciais de acesso para utilizar o sistema em produção

https://inova-caragua.vercel.app/

Conta admin:

Email: admin@admin.com

Senha: admin

---

Conta escola:

Email: escola@escola.com

Senha: escola

---

Conta triagem:

Email: triagem@triagem.com

Senha: triagem