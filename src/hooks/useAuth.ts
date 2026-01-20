import { useState, useEffect } from 'react'
import { supabase, type UserProfile } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { RegisterFormData } from '../utils/validation'

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error
            setProfile(data)
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const register = async (formData: RegisterFormData) => {
        try {
            setLoading(true)

            // Check if username already exists
            const { data: existingUsername } = await supabase
                .from('user_profiles')
                .select('username')
                .eq('username', formData.username)
                .single()

            if (existingUsername) {
                throw new Error('Username already taken')
            }

            // Register user with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        username: formData.username,
                        branch: formData.branch,
                    },
                },
            })

            if (authError) throw authError

            // Create user profile
            if (authData.user) {
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .insert({
                        id: authData.user.id,
                        full_name: formData.fullName,
                        username: formData.username,
                        email: formData.email,
                        branch: formData.branch,
                    })

                if (profileError) throw profileError
            }

            return { success: true, data: authData }
        } catch (error: any) {
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    const login = async (identifier: string, password: string) => {
        try {
            setLoading(true)

            // Check if identifier is email or username
            const isEmail = identifier.includes('@')
            let email = identifier

            if (!isEmail) {
                // Look up email by username
                const { data: profileData, error: profileError } = await supabase
                    .from('user_profiles')
                    .select('email')
                    .eq('username', identifier)
                    .single()

                if (profileError || !profileData) {
                    throw new Error('Invalid username or password')
                }

                email = profileData.email
            }

            // Sign in with email
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            return { success: true, data }
        } catch (error: any) {
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            return { success: true }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }

    return {
        user,
        profile,
        loading,
        register,
        login,
        logout,
    }
}
