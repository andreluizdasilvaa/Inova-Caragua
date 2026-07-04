"use client"

import { forgotPassword, type ForgotPasswordState } from "@/app/actions/auth/password-reset"
import { useActionState } from "react"

const initialState: ForgotPasswordState = {
    status: "idle",
    message: "",
}

export function ForgotPasswordForm() {
    const [state, formAction, isPending] = useActionState(forgotPassword, initialState)

    return (
        <form action={formAction} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    required
                />
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
                disabled={isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out cursor-pointer"
            >
                {isPending ? "Enviando..." : "Enviar link de recuperação"}
            </button>
        </form>
    )
}