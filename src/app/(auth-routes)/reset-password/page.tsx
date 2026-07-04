import Link from "next/link"
import { ResetPasswordForm } from "@/app/(auth-routes)/reset-password/_components/reset-password-form"
import { getResetTokenUserId } from "@/app/actions/auth/password-reset-tokens"

type ResetPasswordPageProps = {
    searchParams: Promise<{ token?: string | string[] }>
}

function normalizeToken(value?: string | string[]) {
    if (Array.isArray(value)) {
        return value[0] ?? ""
    }

    return value ?? ""
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    const params = await searchParams
    const token = normalizeToken(params.token)

    const userId = token ? await getResetTokenUserId(token) : null
    const isValidToken = Boolean(userId)

    return (
        <main className="min-h-screen bg-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-3">Redefinir senha</h1>
                <p className="text-sm text-gray-600 text-center mb-8">
                    Defina uma nova senha para sua conta.
                </p>

                {isValidToken ? (
                    <ResetPasswordForm token={token} />
                ) : (
                    <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
                            Link inválido ou expirado.
                        </div>

                        <Link
                            href="/forgot-password"
                            className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out"
                        >
                            Solicitar novo link
                        </Link>
                    </div>
                )}
            </div>
        </main>
    )
}