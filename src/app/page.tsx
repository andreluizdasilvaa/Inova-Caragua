"use client"

import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useEffect } from "react";
import Logo from '@/assets/logo_inova.png'
import React from 'react'

export default function Login() {
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState('')

    const router = useRouter()
    const { data: session, status } = useSession()

    // Redireciona o usuário com base no papel após o login
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.papel) {
            const papel = session.user.papel
            
            if (papel === 'ESCOLA') {
                router.replace('/school')
            } else if (papel === 'MESTRE') {
                router.replace('/admin')
            } else if (papel === 'TRIAGEM') {
                router.replace('/triage')
            }
        }
    }, [status, session, router])

    async function handleSubmit(event: SyntheticEvent) {
        event.preventDefault()
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
    }
    
    return (
        <div className="min-h-screen bg-brand-ice flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
                {/* Brand Header */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <Image 
                        src={Logo}
                        alt="Logo Inova Caragua"
                        width={200}
                    />
                </div>

                <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Login</h2>

                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md mb-4" role="alert">
                        <p className="text-sm text-center">{error}</p>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-transparent transition placeholder:text-slate-400"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                            Senha
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-transparent transition placeholder:text-slate-400"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-blue hover:bg-brand-teal text-white font-semibold py-2.5 px-4 rounded-lg transition duration-150 ease-in-out transform hover:scale-[1.02] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Carregando...' : 'Entrar'}
                    </button>

                    <p className="text-center text-sm text-slate-500 mt-4">
                        Esqueceu a senha? <a href="/forgot-password" className="text-brand-blue hover:text-brand-teal font-medium transition">Redefinir senha</a>
                    </p>
                </form>
            </div>
        </div>
    )
}
