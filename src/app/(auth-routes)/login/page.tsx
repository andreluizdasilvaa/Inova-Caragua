"use client"

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SyntheticEvent } from "react";
import React from 'react'

export default function Login() {
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState('')

    const router = useRouter()

    async function handleSubmit(event: SyntheticEvent) {
        event.preventDefault();
        setError('')
        setLoading(true)

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        })

        if(result?.error) {
            console.log("Erro ao realizar login: ", result.error)
            setLoading(false)

            if(result.error == 'CredentialsSignin') {
                setError('Credenciais inválidas')
                return
            }

            setError('Erro ao realizar login')
            return
        }

        setLoading(false)
        router.replace('/')
    }
    
    return (
        <div className="min-h-screen bg-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Login</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Erro:</strong>
                        <p className="text-red-500 text-center mb-4">{error}</p>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Senha
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 cursor-pointer"
                    >
                        {loading ? 'Carregando...' : 'Entrar'}
                    </button>

                    <p className="text-center text-sm text-gray-500 mt-4">
                        Esqueceu a senha? <a href="/forgot-password" className="text-indigo-600 hover:text-indigo-700 font-medium">Redefinir senha</a>
                    </p>
                </form>
            </div>
        </div>
    )
}