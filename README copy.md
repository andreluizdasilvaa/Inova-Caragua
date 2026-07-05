# Sistema de Gestão Inova-Caragua

Um sistema completo de gestão de inventário e ocorrências, com autenticação pronta para uso com **Next.js 16**, **NextAuth.js 4** e **Prisma ORM**, banco de dados PostgreSQL e styling com Tailwind CSS.

## 📋 Índice

- [Características](#características)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração das API Keys](#configuração-das-api-keys)
- [Como Usar a Plataforma](#como-usar-a-plataforma)
- [Contas de Teste](#contas-de-teste)

## ✨ Características

- Sistema de autenticação com múltiplos perfis (Escola, Triagem, Admin)
- Gestão de inventário de itens
- Registro e acompanhamento de ocorrências
- Fluxo de triagem e aprovação
- Visualização de status das ocorrências

## 📦 Pré-requisitos

- Node.js 18+
- PostgreSQL
- Redis (Upstash)

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/andreluizdasilvaa/Inova-Caragua.git
cd Inova-Caragua
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as variáveis do `.env.example`:

```bash
cp .env.example .env.local
```

Preencha as variáveis conforme as instruções abaixo.

### 4. Configure o banco de dados

```sql
-- Abra seu cliente PostgreSQL (psql, pgAdmin, etc)
CREATE DATABASE inova_caragua;
```

### 5. Execute as migrações Prisma

```bash
npx prisma migrate dev --name init
```

### 6. Execute o seed do banco (opcional)

```bash
npx prisma db seed
```

### 7. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🔑 Configuração das API Keys

### NEXTAUTH_SECRET

Gere uma chave secreta para criptografia do JWT:

```bash
# Linux/Mac
openssl rand -base64 32

# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
```

### DATABASE_URL e DIRECT_URL

Configure com as credenciais do seu banco PostgreSQL:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/inova_caragua"
DIRECT_URL="postgresql://usuario:senha@localhost:5432/inova_caragua"
```

### Upstash Redis

1. Acesse [Upstash Console](https://console.upstash.com/)
2. Crie um novo Redis database
3. Copie a URL e o Token REST para:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### Resend (E-mails)

1. Acesse [Resend Console](https://resend.com/)
2. Crie uma conta e obtenha sua API Key
3. Configure:
   - `RESEND_API_KEY` - Sua chave API do Resend
   - `RESEND_FROM_EMAIL` - Email remetente (ex: `Inova Caragua <no-reply@seudominio.com>`)

## 📖 Como Usar a Plataforma

### Fluxo Completo de Utilização

#### 1. Login como Usuário Escola

- Acesse a plataforma com as credenciais de escola
- Navegue até a página **Inventário**

#### 2. Cadastrar um Item

- Clique em **"Novo Item"**
- Preencha as informações do item:
  - **Chave de Patrimônio**: ID único encontrado fisicamente em órgãos públicos
  - Demais campos conforme necessário
- Clique em **"Cadastrar"**

#### 3. Criar uma Ocorrência

- Acesse a página **Ocorrências**
- Clique em **"Nova Ocorrência"**
- Preencha os dados da ocorrência
- Selecione o item do inventário relacionado
- Clique em **"Cadastrar"**

#### 4. Triagem (Usuário Triagem)

- Faça logout e login com a conta de triagem
- Acesse a página **Triagem / Monitoramento**
- Em **Ações da Triagem**, selecione o chamado cadastrado anteriormente
- Analise as informações
- Defina o **nível de prioridade**
- Adicione observações se necessário
- Clique em **"Enviar para Aprovação"**

#### 5. Aprovação (Usuário Admin)

- Faça logout e login com a conta admin
- Acesse a página **Aprovação**
- Clique no chamado que foi feito triagem
- Clique em **"Agenda"**
- Adicione observações (em ambiente real, o secretário da SEDUC entraria em contato com a empresa terceirizada)
- Salve as alterações

#### 6. Acompanhamento

- Na página **Ocorrências**, você pode visualizar a mudança do status do chamado
- Faça logout e login como escola para verificar o andamento do seu chamado

## 👥 Contas de Teste

### Conta Admin
- **Email:** admin@admin.com
- **Senha:** admin

### Conta Escola
- **Email:** escola@escola.com
- **Senha:** escola

### Conta Triagem
- **Email:** triagem@triagem.com
- **Senha:** triagem

> **Nota:** O admin tem o mesmo nível de acesso que triagem, mas o triagem não tem o mesmo nível de acesso que o admin.

## 📁 Estrutura do Projeto

```
inova-caragua/
├── src/
│   ├── app/                    # Aplicação Next.js (App Router)
│   ├── components/             # Componentes React
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Funções utilitárias
│   ├── providers/              # Providers React
│   └── types/                  # Tipos TypeScript
├── prisma/                     # Schema e migrações do Prisma
├── public/                     # Arquivos estáticos
└── .env.example               # Exemplo de variáveis de ambiente
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
- [Upstash Redis](https://upstash.com/docs)
- [Resend Email](https://resend.com/docs)