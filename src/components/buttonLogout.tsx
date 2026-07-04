"use client"

import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function ButtonLogout() {
    const [loading, setLoading] = useState(false)

    const router = useRouter()

    async function logout() {
        setLoading(true)

        await signOut({
            redirect: false,
        })

        setLoading(false)
        router.replace('/')
    }

    return (
        <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 ease-in-out cursor-pointer">
            {loading ? 'Logging out...' : 'Logout'}
        </button>
    )
}