import Link from 'next/link';

export default function Home() {
    return (
        <main className="min-h-screen bg-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Bem-vindo</h1>

                <p className="text-gray-600 text-lg mb-8">
                    Faça login ou crie uma conta para começar
                </p>

                <div className="space-y-4">
                    <Link
                        href="/login"
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                    >
                        Entrar
                    </Link>

                    <Link
                        href="/register"
                        className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                    >
                        Criar Conta
                    </Link>
                </div>

                <p className="text-gray-500 text-sm mt-6">
                    Acesso seguro com NextAuth.js
                </p>
            </div>
        </main>
    );
}
