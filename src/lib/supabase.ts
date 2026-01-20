/**
 * ============================================================================
 * SUPABASE CLIENT CONFIGURATION
 * ============================================================================
 * 
 * FILE PURPOSE:
 * This file creates and exports the Supabase client that your app uses to
 * talk to your Supabase backend (database + authentication).
 * 
 * WHERE IT'S USED:
 * - src/hooks/useAuth.ts → All authentication operations (login, signup, etc.)
 * - Any file that needs to query the database
 * 
 * CONNECTIONS:
 * ┌─────────────────┐
 * │ supabase.ts     │ ← YOU ARE HERE
 * │ (This file)     │
 * └────────┬────────┘
 *          │ Exports: supabase client & UserProfile type
 *          ↓
 * ┌─────────────────┐
 * │ useAuth.ts      │ ← Uses the supabase client
 * │ (Auth logic)    │
 * └────────┬────────┘
 *          │ Exports: login(), register(), logout() functions
 *          ↓
 * ┌─────────────────┐
 * │ LoginPage.tsx   │ ← Calls login()
 * │ RegisterPage.tsx│ ← Calls register()
 * │ Dashboard.tsx   │ ← Uses user data
 * └─────────────────┘
 * 
 * ============================================================================
 */

// Import the Supabase library's main client creator function
import { createClient } from '@supabase/supabase-js'

/**
 * CONFIGURATION - Your Supabase Project Credentials
 * 
 * IMPORTANT: These are PUBLIC keys and safe to expose in frontend code.
 * They only allow operations permitted by your Row Level Security (RLS) policies.
 */

// Your Supabase project URL - this is where your backend lives
// Find this in: Supabase Dashboard → Project Settings → API
const supabaseUrl = 'https://tpvidhjwzheswatnxwxi.supabase.co'

// Anonymous/Public key - allows public access to your API
// This key has limited permissions based on your RLS policies
// Find this in: Supabase Dashboard → Project Settings → API → Project API keys → anon public
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwdmlkaGp3emhlc3dhdG54d3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMDU1NzksImV4cCI6MjA4MzU4MTU3OX0.Wgtbj5i3Dz8qg7CRlVThVsCti9Mh4ortc5-wM81PmPQ'

/**
 * CREATE THE SUPABASE CLIENT
 * 
 * This creates a connection to your Supabase backend.
 * Think of it like a phone that can call your database and auth services.
 * 
 * EXPORT: Makes this available to other files via "import { supabase } from './lib/supabase'"
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * ============================================================================
 * TYPE DEFINITIONS
 * ============================================================================
 * 
 * These TypeScript interfaces define the shape of your data.
 * They help catch bugs by making sure you don't access properties that don't exist.
 */

/**
 * USER PROFILE TYPE
 * 
 * Defines the structure of data stored in the "user_profiles" table.
 * This matches the table created by supabase-schema.sql
 * 
 * WHERE IT'S USED:
 * - useAuth.ts → When fetching user profile data
 * - Dashboard.tsx → When displaying user information
 * 
 * FIELDS EXPLAINED:
 * - id: Unique identifier linking to auth.users table
 * - full_name: User's full name (e.g., "John Doe")
 * - username: Unique username for login (e.g., "johndoe")
 * - email: User's email address
 * - branch: One of three company branches
 * - created_at: When the profile was created
 * - updated_at: When the profile was last modified
 */
export interface UserProfile {
    id: string
    full_name: string
    username: string
    email: string
    branch: 'QM Builders' | 'Adamant Dev Corp.' | 'QG Dev Corp.'  // Only these 3 values allowed
    avatar_url?: string  // Optional: URL to user's profile picture
    created_at: string
    updated_at: string
}

/**
 * ============================================================================
 * HOW TO USE THIS FILE:
 * ============================================================================
 * 
 * EXAMPLE 1: Import the Supabase client
 * ```typescript
 * import { supabase } from './lib/supabase'
 * 
 * // Now you can use it to query the database
 * const { data, error } = await supabase
 *   .from('user_profiles')
 *   .select('*')
 *   .eq('id', userId)
 * ```
 * 
 * EXAMPLE 2: Import and use the UserProfile type
 * ```typescript
 * import { type UserProfile } from './lib/supabase'
 * 
 * // Now you can type your variables
 * const [profile, setProfile] = useState<UserProfile | null>(null)
 * ```
 * 
 * EXAMPLE 3: Import both
 * ```typescript
 * import { supabase, type UserProfile } from './lib/supabase'
 * 
 * const fetchProfile = async (): Promise<UserProfile | null> => {
 *   const { data } = await supabase
 *     .from('user_profiles')
 *     .select('*')
 *     .single()
 *   return data
 * }
 * ```
 * 
 * ============================================================================
 */
