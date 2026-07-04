"use server"

import bcrypt from "bcrypt"
import prisma from "@/lib/prisma"
import { redis } from "@/lib/redis"
import { resend } from "@/mail/resend"
import { render } from "@react-email/render"
import PasswordResetEmail from "@/mail/templates/PasswordResetEmail"
import {
    PASSWORD_RESET_TOKEN_BYTES,
    PASSWORD_RESET_TTL_SECONDS,
    hashToken,
    passwordResetTokenKey,
    passwordResetUserKey,
} from "@/app/actions/auth/password-reset-tokens"
import crypto from "crypto"

const PASSWORD_RESET_LINK_PATH = "/reset-password"

export type ActionState = {
    status: "idle" | "success" | "error"
    message: string
}

export type ForgotPasswordState = ActionState
export type ResetPasswordState = ActionState

// Funções auxiliares para normalizar e validar dados de entrada 
function normalizeEmail(value: FormDataEntryValue | null) {
    if (typeof value !== "string") {
        return ""
    }

    return value.trim().toLowerCase()
}

// Função para validar o formato do e-mail
function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Função para validar a força da senha
function validatePassword(password: string) {
    if (password.length < 12) {
        return false
    }

    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
}

// Função para obter a URL base da aplicação, usada para construir links de redefinição de senha
function getAppUrl() {
    return process.env.NEXTAUTH_URL ?? "http://localhost:3000"
}

// Função para construir a URL de redefinição de senha com o token como parâmetro de consulta
function buildResetUrl(token: string) {
    const url = new URL(PASSWORD_RESET_LINK_PATH, getAppUrl())
    url.searchParams.set("token", token)
    return url.toString()
}

// Função para construir o texto do e-mail de redefinição de senha
function buildPasswordResetText(resetUrl: string, expirationMinutes: number) {
    return [
        "Recebemos uma solicitação para redefinir sua senha.",
        `Use este link para criar uma nova senha: ${resetUrl}`,
        `Este link expira em ${expirationMinutes} minutos.`,
        "Se você não solicitou isso, ignore este e-mail.",
    ].join("\n\n")
}

// --

// Função para enviar o e-mail de redefinição de senha usando a API do Resend
export async function forgotPassword(
    _previousState: ForgotPasswordState,
    formData: FormData,
): Promise<ForgotPasswordState> {
    // TODO: rate limit

    const email = normalizeEmail(formData.get("email"))

    // Se o e-mail não for válido, retornamos sucesso para não revelar se o e-mail está cadastrado ou não.
    if (!email || !isValidEmail(email)) {
        return {
            status: "success",
            message: "Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.",
        }
    }

    // Procuramos o usuário pelo e-mail no DB
    const user = await prisma.usuario.findUnique({
        where: { email },
        select: { id: true, email: true },
    })

    // Se o usuário existir:
    if (user) {
        // Verificamos se já tem um token de reset de senha para este usuário
        const previousTokenHash = await redis.get<string>(passwordResetUserKey(user.id))

        // removemos o token antigo se existir
        if (previousTokenHash) {
            await redis.del(passwordResetTokenKey(previousTokenHash))
            await redis.del(passwordResetUserKey(user.id))
        }

        // Geramos um novo token de reset de senha
        const token = crypto.randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString("hex")
        // Hash do token para armazenar no Redis
        const tokenHash = hashToken(token)
        // Construímos a URL de reset de senha que será enviada por e-mail
        const resetUrl = buildResetUrl(token)
        // Calculamos o tempo de expiração em minutos para exibir no e-mail
        const expirationMinutes = Math.round(PASSWORD_RESET_TTL_SECONDS / 60)

        // Armazenamos o token e o userId no Redis com TTL
        await redis.set(passwordResetTokenKey(tokenHash), user.id, {
            ex: PASSWORD_RESET_TTL_SECONDS,
        })

        // Armazenamos o hash do token associado ao userId para poder invalidar tokens antigos
        await redis.set(passwordResetUserKey(user.id), tokenHash, {
            ex: PASSWORD_RESET_TTL_SECONDS,
        })

        try {
            // Renderizamos o e-mail de reset de senha usando o template React
            const html = await render(
                PasswordResetEmail({ resetUrl, expirationMinutes }),
            )

            // Enviamos o e-mail usando a API do Resend
            const { data, error } = await resend.emails.send({
                from: "onboarding@resend.dev",
                to: user.email,
                subject: "Redefinição de senha",
                text: buildPasswordResetText(resetUrl, expirationMinutes),
                html,
            })

            // Logamos o resultado do envio do e-mail para depuração
            if (error) {
                console.error("[forgotPassword] Resend retornou erro:", error)
            } else {
                console.log("[forgotPassword] E-mail enviado, id:", data?.id)
            }
        } catch (err) {
            console.error("[forgotPassword] Falha ao renderizar/enviar e-mail:", err)
        }
    }

    return {
        status: "success",
        message: "Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.",
    }
}

// Função para redefinir a senha do usuário usando o token de reset
export async function resetPassword(
    _previousState: ResetPasswordState,
    formData: FormData,
): Promise<ResetPasswordState> {
    // TODO: rate limit

    // Extraímos os valores do formulário
    const tokenValue = formData.get("token")
    const newPasswordValue = formData.get("newPassword")
    const confirmPasswordValue = formData.get("confirmPassword")

    const token = typeof tokenValue === "string" ? tokenValue : ""
    const newPassword = typeof newPasswordValue === "string" ? newPasswordValue : ""
    const confirmPassword = typeof confirmPasswordValue === "string" ? confirmPasswordValue : ""

    // Validações básicas: se algum campo estiver vazio, ou se as senhas não coincidirem ou não atenderem aos critérios de segurança, retornamos erro.
    if (!token || !newPassword || !confirmPassword) {
        return {
            status: "error",
            message: "Não foi possível redefinir sua senha.",
        }
    }

    if (newPassword !== confirmPassword || !validatePassword(newPassword)) {
        return {
            status: "error",
            message: "As senhas devem ser iguais e atender aos critérios de segurança.",
        }
    }

    // Verificamos se o token é válido no Redis e obtemos o userId associado
    const tokenHash = hashToken(token)
    const tokenKey = passwordResetTokenKey(tokenHash)
    const userId = await redis.get<string>(tokenKey)

    // Se o token não for válido ou expirado, retornamos erro.
    if (!userId) {
        return {
            status: "error",
            message: "Não foi possível redefinir sua senha, tente novamente.",
        }
    }

    // Se o token for válido, removemos o token do Redis para invalidá-lo e atualizamos a senha do usuário no banco de dados.
    await redis.del(tokenKey)
    await redis.del(passwordResetUserKey(userId))

    // Hash da nova senha antes de armazenar no banco de dados
    const passwordHash = await bcrypt.hash(newPassword, 12)

    // Atualizamos a senha do usuário no banco de dados usando o Prisma ORM
    await prisma.usuario.update({
        where: { id: userId },
        data: { senhaHash: passwordHash },
    })

    return {
        status: "success",
        message: "Sua senha foi redefinida com sucesso.",
    }
}