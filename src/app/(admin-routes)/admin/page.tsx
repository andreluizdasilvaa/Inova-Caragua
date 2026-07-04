
// Pagina protegida (apenas users logados podem acesar)

import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/route"
import { ButtonLogout } from "@/components/buttonLogout"
import { getServerSession } from "next-auth"

export default async function Admin() {
    const session = await getServerSession(nextAuthOptions)
    console.log("Session:", session) // Debug

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">Painel Admin</h1>
                    <ButtonLogout />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Bem-vindo!</h2>
                    <p className="text-gray-600">Olá {session?.user.name}, você está autenticado no sistema.</p>
                    <p>Email: {session?.user.email}</p>
                    <p>ID: {session?.user.id}</p>
                </div>
            </main>
        </div>
    )
}