import { z } from 'zod'

// Password validation schema
export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')

// Login form validation
export const loginSchema = z.object({
    identifier: z.string().min(1, 'Email or username is required'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
})

// Registration form validation
export const registerSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be at most 20 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string().email('Invalid email address'),
    branch: z.enum(['QM Builders', 'Adamant Dev Corp.', 'QG Dev Corp.'], {
        message: 'Please select a branch',
    }),
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
        message: 'You must accept the terms and conditions',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>

// Password strength checker
export const checkPasswordStrength = (password: string) => {
    const checks = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    const strength = Object.values(checks).filter(Boolean).length

    return {
        ...checks,
        strength,
        level: strength === 0 ? 'none' : strength <= 2 ? 'weak' : strength === 3 ? 'medium' : 'strong',
    }
}
