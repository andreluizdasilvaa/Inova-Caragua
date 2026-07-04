import crypto from "crypto"
import { redis } from "@/lib/redis"

export const PASSWORD_RESET_TOKEN_BYTES = 32
export const PASSWORD_RESET_TTL_SECONDS = 60

export function hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex")
}

export function passwordResetTokenKey(tokenHash: string) {
    return `password-reset:${tokenHash}`
}

export function passwordResetUserKey(userId: string) {
    return `password-reset:user:${userId}`
}

/**
 * Verifica se um token de reset de senha (o valor cru, vindo da URL)
 * ainda é válido no Redis. Retorna o userId associado, ou null se
 * o token for inexistente/expirado/inválido.
 */
export async function getResetTokenUserId(token: string): Promise<string | null> {
    if (!token) {
        return null
    }

    const tokenHash = hashToken(token)
    const userId = await redis.get<string>(passwordResetTokenKey(tokenHash))

    return userId ?? null
}