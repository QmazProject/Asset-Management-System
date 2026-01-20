import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { registerSchema, type RegisterFormData } from '../utils/validation'
import { useAuth } from '../hooks/useAuth'
import { PasswordStrengthIndicator } from '../components/PasswordStrengthIndicator'
import { Eye, EyeOff, User, Mail, Building2, Lock, Loader2, CheckCircle2 } from 'lucide-react'

export const RegisterPage = () => {
    const navigate = useNavigate()
    const { register: registerUser } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [registrationSuccess, setRegistrationSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    })

    const password = watch('password', '')

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true)
        setError('')

        const result = await registerUser(data)

        if (result.success) {
            setRegistrationSuccess(true)
            setTimeout(() => {
                navigate('/login')
            }, 3000)
        } else {
            setError(result.error || 'Registration failed')
        }

        setIsLoading(false)
    }

    if (registrationSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 animated-gradient">
                <div className="w-full max-w-md animate-slide-up">
                    <div className="glass-intense rounded-2xl p-8 shadow-2xl text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6 animate-bounce">
                            <CheckCircle2 className="w-12 h-12 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Registration Successful!</h2>
                        <p className="text-dark-300 mb-4">
                            Please check your email to confirm your account before logging in.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-dark-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Redirecting to login...</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-12 animated-gradient">
            <div className="w-full max-w-md animate-slide-up">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600 mb-4 animate-glow">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-dark-300">Join the Asset Management System</p>
                </div>

                {/* Registration Form */}
                <div className="glass-intense rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
                                {error}
                            </div>
                        )}

                        {/* Full Name */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-dark-200 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    {...register('fullName')}
                                    id="fullName"
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none input-glow transition-all"
                                    placeholder="John Doe"
                                    autoComplete="name"
                                />
                            </div>
                            {errors.fullName && (
                                <p className="mt-1 text-sm text-red-400">{errors.fullName.message}</p>
                            )}
                        </div>

                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-dark-200 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    {...register('username')}
                                    id="username"
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none input-glow transition-all"
                                    placeholder="johndoe"
                                    autoComplete="username"
                                />
                            </div>
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-dark-200 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    {...register('email')}
                                    id="email"
                                    type="email"
                                    className="w-full pl-10 pr-4 py-3 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none input-glow transition-all"
                                    placeholder="john@example.com"
                                    autoComplete="email"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Branch Selection */}
                        <div>
                            <label htmlFor="branch" className="block text-sm font-medium text-dark-200 mb-2">
                                Branch
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <select
                                    {...register('branch')}
                                    id="branch"
                                    className="w-full pl-10 pr-4 py-3 bg-dark-800/50 border border-dark-700 rounded-lg text-white focus:outline-none input-glow transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-dark-800">Select your branch</option>
                                    <option value="QM Builders" className="bg-dark-800">QM Builders</option>
                                    <option value="Adamant Dev Corp." className="bg-dark-800">Adamant Dev Corp.</option>
                                    <option value="QG Dev Corp." className="bg-dark-800">QG Dev Corp.</option>
                                </select>
                            </div>
                            {errors.branch && (
                                <p className="mt-1 text-sm text-red-400">{errors.branch.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-dark-200 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    {...register('password')}
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full pl-10 pr-12 py-3 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none input-glow transition-all"
                                    placeholder="Create password"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                            )}
                            <PasswordStrengthIndicator password={password} />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-200 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    {...register('confirmPassword')}
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="w-full pl-10 pr-12 py-3 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none input-glow transition-all"
                                    placeholder="Confirm password"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Terms Checkbox */}
                        <div>
                            <label className="flex items-start gap-2 cursor-pointer group">
                                <input
                                    {...register('acceptTerms')}
                                    type="checkbox"
                                    className="w-4 h-4 mt-0.5 rounded border-dark-600 bg-dark-800 text-primary-600 focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-0 cursor-pointer"
                                />
                                <span className="text-sm text-dark-300 group-hover:text-dark-200 transition-colors">
                                    I agree to the Terms of Service and Privacy Policy
                                </span>
                            </label>
                            {errors.acceptTerms && (
                                <p className="mt-1 text-sm text-red-400">{errors.acceptTerms.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-primary-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <div className="mt-6 text-center">
                        <p className="text-dark-300 text-sm">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-dark-400 text-xs mt-6">
                    © 2026 Asset Management System. All rights reserved.
                </p>
            </div>
        </div>
    )
}
