"use server"

import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

// Validação forte de senha
function validatePassword(password: string): { valid: boolean; error?: string } {
    if (password.length < 12) {
        return { valid: false, error: "A senha deve ter no mínimo 12 caracteres." };
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        return { 
            valid: false, 
            error: "A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais." 
        };
    }
    
    return { valid: true };
}

export async function registerUser(_: any, formData: FormData) {
    const data = Object.fromEntries(formData.entries());
    
    const name = data.name as string;
    const email = data.email as string;
    const password = data.password as string;

    // Validação de campos obrigatórios
    if (!name || !email || !password) {
        return {
            success: false,
            error: "Todos os campos são obrigatórios.",
        };
    }

    // Validação forte de senha
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        return {
            success: false,
            error: passwordValidation.error,
        };
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            success: false,
            error: "Email inválido.",
        };
    }

    // Sanitização de entrada
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = name.trim().replace(/[<>]/g, ''); // Remove < >
    
    // Verificar tamanho máximo
    if (sanitizedName.length > 100) {
        return { success: false, error: "Nome muito longo." };
    }
    
    // Hash com custo adequado (10-12 é recomendado)
    const passwordHash = await bcrypt.hash(password, 12);
    
    try {
        await prisma.usuario.create({
            data: {
                email: sanitizedEmail,
                senhaHash: passwordHash,
                nome: sanitizedName,
                papel: 'MESTRE'
            }
        });

        return { success: true };
        
    } catch (err: any) {
        // Não vazar informações sensíveis
        if (err.code === "P2002") {
            return {
                success: false,
                error: "Email já cadastrado.",
            };
        }
        
        console.error("Registration error:", err);
        
        return { 
            success: false, 
            error: "Erro ao criar conta. Tente novamente." 
        };
    }
}