"use client"

import { resetPassword, type ResetPasswordState } from "@/app/actions/auth/password-reset"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useActionState } from "react"

const initialState: ResetPasswordState = {
    status: "idle",
    message: "",
}

type ResetPasswordFormProps = {
    token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
    const router = useRouter()
    const [state, formAction, isPending] = useActionState(resetPassword, initialState)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const redirectTimeoutRef = useRef<number | null>(null)

    useEffect(() => {
        if (state.status === "success") {
            redirectTimeoutRef.current = window.setTimeout(() => {
                router.replace("/")
            }, 2000)
        }

        return () => {
            if (redirectTimeoutRef.current !== null) {
                window.clearTimeout(redirectTimeoutRef.current)
                redirectTimeoutRef.current = null
            }
        }
    }, [router, state.status])

    const isLocked = isPending || state.status === "success"

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="token" value={token} />

            <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
                <p className="font-semibold mb-2">Critérios da nova senha</p>
                <ul className="space-y-1 list-disc pl-5">
                    <li>Ter no mínimo 12 caracteres</li>
                    <li>Conter letras maiúsculas</li>
                    <li>Conter letras minúsculas</li>
                    <li>Conter números</li>
                    <li>Conter caracteres especiais</li>
                </ul>
            </div>

            <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Nova senha
                </label>
                <div className="relative">
                    <input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        disabled={isLocked}
                        className="w-full px-4 py-2 pr-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword((currentValue) => !currentValue)}
                        disabled={isLocked}
                        className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-gray-500 hover:text-gray-700"
                        aria-label={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-5 w-5"
                        >
                            {showNewPassword ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58A2 2 0 0012 15a2 2 0 001.42-.58M9.88 9.88A3 3 0 0115 12a3 3 0 01-.25 1.22M6.53 6.53C4.25 8.08 2.6 10.03 2 12c1.74 5.7 6.4 8 10 8 1.1 0 2.12-.16 3.06-.44M9.6 4.24A10.65 10.65 0 0112 4c3.6 0 8.26 2.3 10 8-.52 1.7-1.54 3.37-2.87 4.84" />
                            ) : (
                                <>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5S21.75 12 21.75 12s-3.75 7.5-9.75 7.5S2.25 12 2.25 12Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar senha
                </label>
                <div className="relative">
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        disabled={isLocked}
                        className="w-full px-4 py-2 pr-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword((currentValue) => !currentValue)}
                        disabled={isLocked}
                        className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-gray-500 hover:text-gray-700"
                        aria-label={showConfirmPassword ? "Ocultar senha confirmada" : "Mostrar senha confirmada"}
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-5 w-5"
                        >
                            {showConfirmPassword ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58A2 2 0 0012 15a2 2 0 001.42-.58M9.88 9.88A3 3 0 0115 12a3 3 0 01-.25 1.22M6.53 6.53C4.25 8.08 2.6 10.03 2 12c1.74 5.7 6.4 8 10 8 1.1 0 2.12-.16 3.06-.44M9.6 4.24A10.65 10.65 0 0112 4c3.6 0 8.26 2.3 10 8-.52 1.7-1.54 3.37-2.87 4.84" />
                            ) : (
                                <>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5S21.75 12 21.75 12s-3.75 7.5-9.75 7.5S2.25 12 2.25 12Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {state.status !== "idle" && state.message ? (
                <div
                    className={`border px-4 py-3 rounded-lg text-sm ${state.status === "success"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-red-50 border-red-200 text-red-700"
                        }`}
                    role="status"
                >
                    {state.message}
                </div>
            ) : null}

            <button
                type="submit"
                disabled={isLocked}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out cursor-pointer"
            >
                {isPending ? "Redefinindo..." : state.status === "success" ? "Senha atualizada. Redirecionando..." : "Redefinir senha"}
            </button>
        </form>
    )
}