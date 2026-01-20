import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { loginSchema, type LoginFormData } from '../utils/validation'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react'

export const LoginPage = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true)
        setError('')

        const result = await login(data.identifier, data.password)

        if (result.success) {
            navigate('/dashboard')
        } else {
            setError(result.error || 'Invalid credentials')
        }

        setIsLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 animated-gradient">
            <div className="w-full max-w-md animate-slide-up">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600 mb-4 animate-glow">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-dark-300">Sign in to your Asset Management System</p>
                </div>

                {/* Login Form */}
                <div className="glass-intense rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
                                {error}
                            </div>
                        )}

                        {/* Email/Username Input */}
                        <div>
                            <label htmlFor="identifier" className="block text-sm font-medium text-dark-200 mb-2">
                                Email or Username
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    {...register('identifier')}
                                    id="identifier"
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none input-glow transition-all"
                                    placeholder="Enter email or username"
                                    autoComplete="username"
                                />
                            </div>
                            {errors.identifier && (
                                <p className="mt-1 text-sm text-red-400">{errors.identifier.message}</p>
                            )}
                        </div>

                        {/* Password Input */}
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
                                    placeholder="Enter password"
                                    autoComplete="current-password"
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
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    {...register('rememberMe')}
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-600 focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-0 cursor-pointer"
                                />
                                <span className="text-sm text-dark-300 group-hover:text-dark-200 transition-colors">
                                    Remember me
                                </span>
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                            >
                                Forgot password?
                            </Link>
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
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <p className="text-dark-300 text-sm">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                            >
                                Sign up
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
