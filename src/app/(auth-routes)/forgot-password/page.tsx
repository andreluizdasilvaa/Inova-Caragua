import Link from "next/link"
import { ForgotPasswordForm } from "@/app/(auth-routes)/forgot-password/_components/forgot-password-form"

export default function ForgotPasswordPage() {
    return (
        <main className="min-h-screen bg-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-3">Esqueci minha senha</h1>
                <p className="text-sm text-gray-600 text-center mb-8">
                    Informe seu e-mail para receber um link de redefinição.
                </p>

                <ForgotPasswordForm />

                <p className="text-center text-sm text-gray-500 mt-6">
                    Lembrou da senha? <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Voltar para login</Link>
                </p>
            </div>
        </main>
    )
}